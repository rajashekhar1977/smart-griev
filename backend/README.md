# Smart Griev Backend

Python Flask backend with NLP-powered complaint classification.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download NLTK data (one-time setup):
```python
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

4. Create `.env` file from `.env.example` and add your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

5. Run the server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/complaints/submit` - Submit new complaint
- `GET /api/complaints` - Get complaints (filtered by role)
- `GET /api/complaints/<id>` - Get complaint details
- `PUT /api/complaints/<id>/status` - Update complaint status
- `POST /api/nlp/classify` - Classify text (testing)
- `GET /api/departments` - Get all departments
- `GET /api/analytics` - Get dashboard statistics
- `GET /api/notifications` - Get user notifications

## NLP Classification

The backend uses a hybrid approach:
1. **Keyword-based classification** - Fast, rule-based matching
2. **Machine Learning** - TF-IDF + Naive Bayes for better accuracy
3. **Sentiment Analysis** - TextBlob for urgency detection

The system automatically trains on synthetic data and improves over time.

## Deployment

For production, use gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
