# Django Livekit Radio

A radio-style chat app built with Django REST Framework, LiveKit, and Next.js.

Users can register, log in, tune to a frequency, and talk with everyone on the same channel (push-to-talk style).

A profile page is available for users to update their information or password.

Admin users can access the administration panel and see the list of room joins logs.

## Features

- 🔑 **User registration and login with JWT (Django + DRF)**
- 🎚️ **Tune to frequency rooms** (`freq-<number>`)
- 🎤 **Real-time audio chat with LiveKit**
- 🖥️ **Next.js frontend with login and push-to-talk UI**
- 🐳 **Backend Dockerized for deployment on AWS ECS**
- 🚀 **Frontend deployable with Netlify**

## Tech Stack

- **Backend:** Django, Django Rest Framework, SimpleJWT, LiveKit Server SDK
- **Frontend:** Next.js, `@livekit/components-react`, Shadcn/ui, Tailwind CSS
- **Database:** Postgres (RDS) for prod, Docker for local dev
- **Deployment:**  [GitHub Actions](.github/workflows/deploy-production-aws-netlify.yml),  Docker, AWS ECR + ECS Fargate + ALB (API) + Netlify (frontend)

## Quickstart

### Environment Variables

- Backend ([.env.example](api/.env.example)):

```env
SECRET_KEY=your_django_secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

- Frontend ([.env.example](web/.env.example)):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server
```
### Backend

- With Docker

```bash
docker-compose up -d
```

- Without Docker

```bash
cd api
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
python manage.py runserver
```

### Frontend

```bash
cd web
npm install
npm run dev
```

## Useful Commands
- `pip freeze > requirements.txt` - Freeze Python package dependencies
- `source api/venv/bin/activate` - Activate Python virtual environment
- `python manage.py createsuperuser` - Create admin user
- `python manage.py runserver` - Run Django development server
- `python manage.py makemigrations` - Create new migrations based on the changes you have made to your models