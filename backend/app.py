from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from config import Config
from nlp_classifier import classifier
import datetime
import re

app = Flask(__name__)
CORS(app)

supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
supabase_admin: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)

def get_auth_user(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Missing or invalid authorization header'

    token = auth_header.replace('Bearer ', '')

    try:
        user = supabase.auth.get_user(token)
        return user.user, None
    except Exception as e:
        return None, str(e)

def generate_complaint_id():
    current_year = datetime.datetime.now().year

    try:
        result = supabase_admin.table('complaints').select('id').order('created_at', desc=True).limit(1).execute()

        if result.data and len(result.data) > 0:
            last_id = result.data[0]['id']
            match = re.search(r'-(\d+)$', last_id)
            if match:
                next_num = int(match.group(1)) + 1
            else:
                next_num = 1
        else:
            next_num = 1
    except:
        next_num = 1

    return f"SMG-{current_year}-{str(next_num).zfill(4)}"

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Smart Griev Backend Running'}), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'CITIZEN')
    department = data.get('department')

    if not email or not password or not name:
        return jsonify({'error': 'Email, password, and name are required'}), 400

    try:
        auth_response = supabase.auth.sign_up({
            'email': email,
            'password': password
        })

        if auth_response.user:
            profile_data = {
                'id': auth_response.user.id,
                'name': name,
                'role': role,
                'phone': data.get('phone', ''),
                'department': department if role == 'OFFICER' else None
            }

            supabase.table('profiles').insert(profile_data).execute()

            return jsonify({
                'user': {
                    'id': auth_response.user.id,
                    'email': auth_response.user.email,
                    'name': name,
                    'role': role,
                    'department': department
                },
                'session': {
                    'access_token': auth_response.session.access_token if auth_response.session else None
                }
            }), 201
        else:
            return jsonify({'error': 'Registration failed'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        auth_response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })

        if auth_response.user:
            profile = supabase.table('profiles').select('*').eq('id', auth_response.user.id).execute()

            profile_data = profile.data[0] if profile.data else {
                'name': email.split('@')[0],
                'role': 'CITIZEN',
                'department': None
            }

            return jsonify({
                'user': {
                    'id': auth_response.user.id,
                    'email': auth_response.user.email,
                    'name': profile_data['name'],
                    'role': profile_data['role'],
                    'department': profile_data.get('department')
                },
                'session': {
                    'access_token': auth_response.session.access_token
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints/submit', methods=['POST'])
def submit_complaint():
    user, error = get_auth_user(request)
    if error:
        return jsonify({'error': error}), 401

    data = request.json
    title = data.get('title')
    description = data.get('description')
    location = data.get('location')

    if not title or not description or not location:
        return jsonify({'error': 'Title, description, and location are required'}), 400

    try:
        nlp_result = classifier.classify(description)

        complaint_id = generate_complaint_id()

        profile = supabase.table('profiles').select('name').eq('id', user.id).execute()
        user_name = profile.data[0]['name'] if profile.data else 'Unknown User'

        complaint_data = {
            'id': complaint_id,
            'user_id': user.id,
            'title': title,
            'description': description,
            'location': location,
            'status': 'Submitted',
            'department': nlp_result['predictedDepartment'],
            'priority': nlp_result['urgency'],
            'confidence_score': nlp_result['confidenceScore'],
            'nlp_analysis': nlp_result,
            'date_submitted': datetime.datetime.utcnow().isoformat(),
            'date_updated': datetime.datetime.utcnow().isoformat()
        }

        result = supabase.table('complaints').insert(complaint_data).execute()

        history_data = {
            'complaint_id': complaint_id,
            'user_id': user.id,
            'action': 'Complaint Submitted',
            'status_from': None,
            'status_to': 'Submitted',
            'comment': 'Initial complaint submission'
        }
        supabase.table('complaint_history').insert(history_data).execute()

        notification_data = {
            'user_id': user.id,
            'complaint_id': complaint_id,
            'type': 'complaint_submitted',
            'message': f'Your complaint {complaint_id} has been submitted and routed to {nlp_result["predictedDepartment"]}'
        }
        supabase.table('notifications').insert(notification_data).execute()

        response_data = result.data[0] if result.data else complaint_data
        response_data['userName'] = user_name

        return jsonify(response_data), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    user, error = get_auth_user(request)
    if error:
        return jsonify({'error': error}), 401

    try:
        profile = supabase.table('profiles').select('role, department').eq('id', user.id).execute()

        if not profile.data:
            return jsonify({'error': 'Profile not found'}), 404

        user_role = profile.data[0]['role']
        user_department = profile.data[0].get('department')

        if user_role == 'CITIZEN':
            result = supabase.table('complaints').select('*').eq('user_id', user.id).order('date_submitted', desc=True).execute()
        elif user_role == 'OFFICER':
            result = supabase.table('complaints').select('*').eq('department', user_department).order('date_submitted', desc=True).execute()
        else:
            result = supabase.table('complaints').select('*').order('date_submitted', desc=True).execute()

        complaints = result.data or []

        for complaint in complaints:
            profile = supabase.table('profiles').select('name').eq('id', complaint['user_id']).execute()
            complaint['userName'] = profile.data[0]['name'] if profile.data else 'Unknown User'

        return jsonify(complaints), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints/<complaint_id>', methods=['GET'])
def get_complaint(complaint_id):
    user, error = get_auth_user(request)
    if error:
        return jsonify({'error': error}), 401

    try:
        result = supabase.table('complaints').select('*').eq('id', complaint_id).execute()

        if not result.data:
            return jsonify({'error': 'Complaint not found'}), 404

        complaint = result.data[0]

        profile = supabase.table('profiles').select('name').eq('id', complaint['user_id']).execute()
        complaint['userName'] = profile.data[0]['name'] if profile.data else 'Unknown User'

        history = supabase.table('complaint_history').select('*').eq('complaint_id', complaint_id).order('created_at', desc=True).execute()
        complaint['history'] = history.data or []

        attachments = supabase.table('complaint_attachments').select('*').eq('complaint_id', complaint_id).execute()
        complaint['attachments'] = attachments.data or []

        return jsonify(complaint), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints/<complaint_id>/status', methods=['PUT'])
def update_status(complaint_id):
    user, error = get_auth_user(request)
    if error:
        return jsonify({'error': error}), 401

    data = request.json
    new_status = data.get('status')
    comment = data.get('comment', '')

    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    try:
        complaint = supabase.table('complaints').select('*').eq('id', complaint_id).execute()

        if not complaint.data:
            return jsonify({'error': 'Complaint not found'}), 404

        old_status = complaint.data[0]['status']

        update_data = {
            'status': new_status,
            'date_updated': datetime.datetime.utcnow().isoformat()
        }

        result = supabase.table('complaints').update(update_data).eq('id', complaint_id).execute()

        history_data = {
            'complaint_id': complaint_id,
            'user_id': user.id,
            'action': 'Status Updated',
            'status_from': old_status,
            'status_to': new_status,
            'comment': comment
        }
        supabase.table('complaint_history').insert(history_data).execute()

        notification_data = {
            'user_id': complaint.data[0]['user_id'],
            'complaint_id': complaint_id,
            'type': 'status_updated',
            'message': f'Your complaint {complaint_id} status has been updated to {new_status}'
        }
        supabase.table('notifications').insert(notification_data).execute()

        return jsonify(result.data[0] if result.data else {}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/nlp/classify', methods=['POST'])
def classify_text():
    user, error = get_auth_user(request)
    if error:
        return jsonify({'error': error}), 401

    data = request.json
    text = data.get('text')

    if not text:
        return jsonify({'error': 'Text is required'}), 400

    try:
        result = classifier.classify(text)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/departments', methods=['GET'])
def get_departments():
    try:
        result = supabase.table('departments').select('*').execute()
        return jsonify(result.data or []), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    user, error = get_auth_user(request)
    if error:
        return jsonify({'error': error}), 401

    try:
        all_complaints = supabase.table('complaints').select('*').execute()
        complaints = all_complaints.data or []

        total = len(complaints)
        pending = len([c for c in complaints if c['status'] not in ['Resolved', 'Closed']])
        resolved = len([c for c in complaints if c['status'] == 'Resolved'])

        if resolved > 0:
            total_time = 0
            count = 0
            for c in complaints:
                if c['status'] == 'Resolved':
                    submitted = datetime.datetime.fromisoformat(c['date_submitted'].replace('Z', '+00:00'))
                    updated = datetime.datetime.fromisoformat(c['date_updated'].replace('Z', '+00:00'))
                    days = (updated - submitted).days
                    total_time += days
                    count += 1
            avg_days = total_time / count if count > 0 else 0
            avg_resolution_time = f"{avg_days:.1f} Days"
        else:
            avg_resolution_time = "N/A"

        return jsonify({
            'total': total,
            'pending': pending,
            'resolved': resolved,
            'avgResolutionTime': avg_resolution_time
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user, error = get_auth_user(request)
    if error:
        return jsonify({'error': error}), 401

    try:
        result = supabase.table('notifications').select('*').eq('user_id', user.id).order('created_at', desc=True).limit(50).execute()
        return jsonify(result.data or []), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/<notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    user, error = get_auth_user(request)
    if error:
        return jsonify({'error': error}), 401

    try:
        result = supabase.table('notifications').update({'is_read': True}).eq('id', notification_id).eq('user_id', user.id).execute()
        return jsonify(result.data[0] if result.data else {}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)
