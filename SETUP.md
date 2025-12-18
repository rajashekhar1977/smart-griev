# Smart Griev - Complete Setup Guide

A fully functional AI-powered complaint management system with NLP-based automatic routing.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python Flask with NLP processing
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **NLP**: scikit-learn, NLTK, TextBlob, spaCy

## Features

- AI-powered complaint classification and routing
- Real-time NLP analysis with confidence scoring
- Role-based access control (Citizen, Officer, Admin)
- Complete complaint lifecycle management
- Analytics dashboard with visualizations
- Secure authentication with JWT
- Mobile-responsive design

## Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.9+
- Supabase account

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. The database schema has already been created via migrations
3. Get your credentials from Project Settings > API:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 2. Frontend Setup

1. Clone the repository and navigate to the project root

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Download NLTK data (one-time setup):
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

5. Create `.env` file in the backend directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_random_secret_key_here
```

6. Run the backend server:
```bash
python app.py
```

The backend API will be available at http://localhost:5000

## Usage

### For Citizens

1. Register a new account with role "Citizen"
2. Submit complaints with description and location
3. AI automatically analyzes and routes to the correct department
4. Track complaint status in real-time
5. View assigned department and confidence score

### For Officers

1. Register with role "Officer" (select department)
2. View complaints assigned to your department
3. See AI analysis including keywords and urgency
4. Update complaint status (In Progress, Resolved, etc.)
5. Add comments and notes to complaints

### For Admins

1. Register with role "Admin"
2. View system-wide analytics and statistics
3. Monitor all complaints across departments
4. Track NLP model performance
5. View department-wise distribution charts

## NLP Classification

The system uses a hybrid approach for routing complaints:

1. **Keyword Matching**: Fast rule-based classification using department-specific keywords
2. **Machine Learning**: TF-IDF vectorization + Naive Bayes classifier
3. **Sentiment Analysis**: TextBlob for urgency detection based on emotional tone
4. **Confidence Scoring**: Combined score from multiple classifiers

### Supported Departments

- Public Works & Infrastructure
- Water Supply & Sanitation
- Electricity & Power
- Transportation
- Health & Medical Services
- Education
- Police & Safety
- Revenue & Tax
- Environment & Pollution
- Consumer Affairs
- Others (fallback)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Complaints
- `POST /api/complaints/submit` - Submit new complaint (authenticated)
- `GET /api/complaints` - Get complaints (filtered by role)
- `GET /api/complaints/<id>` - Get complaint details
- `PUT /api/complaints/<id>/status` - Update complaint status

### NLP & Analytics
- `POST /api/nlp/classify` - Classify text (for testing)
- `GET /api/departments` - Get all departments
- `GET /api/analytics` - Get dashboard statistics
- `GET /api/notifications` - Get user notifications

## Database Schema

### Tables

- `profiles` - User profiles with role and department
- `departments` - Government departments
- `complaints` - Main complaint data with NLP analysis
- `complaint_attachments` - File attachments
- `complaint_history` - Status change audit log
- `notifications` - User notifications
- `nlp_training_data` - ML training data
- `feedback_ratings` - User feedback

### Security

- Row Level Security (RLS) enabled on all tables
- Restrictive policies based on user roles
- JWT-based authentication
- Encrypted passwords with bcrypt

## Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting platform

3. Set environment variables in the hosting dashboard

### Backend (Render/Railway/Heroku)

1. Create a new web service

2. Set the start command:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. Set environment variables

4. Deploy from Git repository

### Environment Variables

Make sure to set all required environment variables in production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (production backend URL)
- Backend `.env` variables

## Troubleshooting

### Frontend Issues

- **Import errors**: Make sure all dependencies are installed with `npm install`
- **API connection errors**: Check that backend is running and `VITE_API_URL` is correct
- **Auth errors**: Verify Supabase credentials in `.env`

### Backend Issues

- **Module not found**: Activate virtual environment and run `pip install -r requirements.txt`
- **NLTK data missing**: Run the NLTK download command again
- **Database connection errors**: Check Supabase credentials in `.env`
- **Port already in use**: Change port in `app.py` or kill the process using port 5000

### NLP Issues

- **Low confidence scores**: The model improves over time with more data
- **Incorrect routing**: You can manually reassign complaints, which helps train the model
- **Slow classification**: First run downloads models, subsequent runs are faster

## Development

### Adding New Departments

1. Add department to `backend/nlp_classifier.py` in the `departments` dictionary
2. Add training examples for the department
3. Insert department into `departments` table in Supabase
4. Retrain the model by restarting the backend

### Improving NLP Accuracy

1. Collect feedback on incorrect classifications
2. Add more training examples to `generate_training_data()`
3. Tune hyperparameters in the classifier
4. Consider using pre-trained BERT models for better accuracy

## License

This project is for educational and government use.

## Support

For issues or questions, please check the troubleshooting section or contact the development team.
