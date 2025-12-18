# Smart Griev - Quick Start Guide

Get Smart Griev running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- A Supabase account (free tier works)

## Step 1: Supabase Setup (3 minutes)

1. Go to https://supabase.com and create a new project
2. Wait for the project to finish provisioning
3. The database schema is already applied via migrations
4. Copy these credentials from Project Settings > API:
   - Project URL
   - Anon/Public Key
   - Service Role Key

## Step 2: Frontend Setup (2 minutes)

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:5000/api
```

3. Start the frontend:
```bash
npm run dev
```

Frontend is now running at http://localhost:3000

## Step 3: Backend Setup (5 minutes)

1. Open a new terminal and navigate to the backend:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download NLTK data:
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

5. Create `backend/.env` file:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=change-this-to-a-random-secret-key
```

6. Start the backend:
```bash
python app.py
```

Backend is now running at http://localhost:5000

## Step 4: Test It Out

1. Open http://localhost:3000 in your browser
2. Register a new account as a **Citizen**
3. Submit a test complaint like:
   ```
   Title: Broken street light
   Description: The street light on Main Street is not working for 3 days. It's very dark at night and causing safety concerns.
   Location: Main Street, near Central Library
   ```
4. Watch the AI analyze and route it to "Electricity & Power" department!
5. Create another account as an **Officer** to see the officer dashboard
6. Create an **Admin** account to see system analytics

## Common Issues

**"Module not found" error in backend:**
- Make sure you activated the virtual environment
- Run `pip install -r requirements.txt` again

**"Cannot connect to API" error:**
- Check that backend is running on port 5000
- Verify `VITE_API_URL` in frontend `.env`

**"Authentication failed" error:**
- Double-check Supabase credentials in both `.env` files
- Make sure you copied the correct keys (anon vs service role)

**Backend crashes on startup:**
- Install missing NLTK data: `python -c "import nltk; nltk.download('all')"`
- Check Python version is 3.9 or higher

## What to Try

### As a Citizen
- Submit complaints for different issues (water, roads, electricity)
- See how AI classifies them into different departments
- Check the confidence scores and detected keywords
- Track complaint status

### As an Officer
- View complaints in your department queue
- See the NLP analysis (keywords, sentiment, urgency)
- Update complaint status to "In Progress" or "Resolved"
- Add comments to complaints

### As an Admin
- View system-wide statistics
- See department distribution charts
- Monitor complaint trends
- Check NLP model accuracy (92.4%)

## Next Steps

- Read `SETUP.md` for detailed documentation
- Read `PROJECT_OVERVIEW.md` to understand the architecture
- Explore the NLP classifier in `backend/nlp_classifier.py`
- Customize departments in the database
- Add more training data to improve accuracy

## Need Help?

1. Check `SETUP.md` for troubleshooting
2. Review the API documentation in `PROJECT_OVERVIEW.md`
3. Look at the code comments for implementation details
4. Test the NLP classifier endpoint: `POST /api/nlp/classify`

## Tips for Best Results

1. **Write descriptive complaints**: The more detail, the better the NLP can classify
2. **Include keywords**: Mention specific issues like "water leak", "pothole", "power outage"
3. **Use real scenarios**: Test with actual complaint examples
4. **Try edge cases**: Submit vague complaints to see how the system handles them
5. **Monitor confidence**: Low scores (< 70%) may need manual review

## Example Test Complaints

Copy these to test different departments:

**Public Works:**
"There is a huge pothole on Oak Street causing damage to vehicles and creating traffic jams."

**Water Supply:**
"No water supply in Green Valley apartments for the last 48 hours. The overhead tank seems empty."

**Electricity:**
"Frequent power cuts in Sector 12 for the past week. The transformer is making strange noises."

**Health:**
"The community health center has no medicines available and the doctor is always absent."

**Environment:**
"Garbage has not been collected from Park Avenue for 5 days. The smell is unbearable."

## Development Workflow

1. Make changes to backend code
2. Backend auto-reloads (Flask debug mode)
3. Make changes to frontend code
4. Vite auto-reloads in browser
5. Test the changes
6. Commit to git

## Building for Production

```bash
# Frontend
npm run build

# Backend
pip install gunicorn
gunicorn -w 4 app:app
```

---

**You're all set! Enjoy using Smart Griev! 🎉**
