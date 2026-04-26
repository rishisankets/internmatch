install:
	cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

run-backend:
	cd backend && source venv/bin/activate && python app.py

run-frontend:
	open index.html

setup: install run-backend