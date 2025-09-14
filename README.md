
# Django Livekit Radio

A radio-style chat app built with Django REST Framework, LiveKit, and Next.js.
Users can register, log in, tune to a frequency, and talk with everyone on the same channel (push-to-talk style).

## Features

- 🔑 **User registration and login with JWT (Django + DRF)**
- 🎚️ **Tune to frequency rooms** (`freq-<number>`)
- 🎤 **Real-time audio chat with LiveKit**
- 🖥️ **Next.js frontend with login and push-to-talk UI**
- 🐳 **Backend Dockerized for deployment on AWS ECS**
- 🚀 **Frontend deployable with Netlify**

## Tech Stack

- **Backend:** Django, DRF, SimpleJWT
- **Realtime:** LiveKit server SDK (token minting) + LiveKit React client
- **Frontend:** Next.js + `@livekit/components-react`
- **Database:** SQLite for dev, Postgres (RDS) for prod
- **Deployment:** Docker + AWS ECS Fargate (API) / Netlify (frontend)

## Quickstart

### Backend

```bash
cd api
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd web
npm install
npm run dev
```

## Environment Variables

### Backend (`.env.example`):

```env
SECRET_KEY=your_django_secret
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

### Frontend (`.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

- **Backend:** Build Docker image, push to Amazon ECR, deploy with ECS Fargate + ALB.
- **Database:** Use Amazon RDS Postgres in production.
- **Frontend:** Deploy `/web` folder on Netlify with environment variables.

## Useful Commands
- `pip freeze > requirements.txt` - Freeze Python package dependencies
- `source api/venv/bin/activate` - Activate Python virtual environment