# 🎯 InternMatch

## Project Structure
```
internship-portal/
├── frontend/
│   ├── index.html      ← Landing page
│   ├── login.html      ← Login page
│   ├── signup.html     ← Signup page
│   ├── dashboard.html  ← Dashboard (Weekend 3)
│   ├── quiz.html       ← Quiz (Weekend 2)
│   ├── styles.css      ← All styles
│   └── auth.js         ← Login & signup logic
└── backend/
    ├── app.py          ← Flask API + all routes
    └── requirements.txt
```

## How to run

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend
Just open `frontend/index.html` in your browser!
Or use Live Server in VS Code for best experience.
