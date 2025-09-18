# GitHub Actions CI/CD for Django Livekit Radio

This project uses GitHub Actions for continuous integration and deployment (CI/CD) of both the backend (Django API) and frontend (Next.js on Netlify).

---

## Workflow File

The main workflow is defined in:

- `.github/workflows/deploy-production-aws-netlify.yml`

---

## Secrets Required

Set these secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION`: For AWS ECR/ECS.
- `ECR_REPOSITORY`: Your AWS ECR repository URI.
- `NETLIFY_BUILD_HOOK_URL`: Netlify build hook URL for triggering builds.
- `NETLIFY_ACCESS_TOKEN`: Netlify Personal Access Token for API access.
- `NETLIFY_SITE_ID`: Your Netlify site ID.

---

## How It Works

### 1. On Push to `master`
- Checks for changes in `api/` and `web/` directories.

### 2. Backend Deployment (if `api/` changed)
- Builds and pushes Docker image to ECR.
- Updates ECS service and waits for deployment.
- Runs Django migrations as an ECS task.

### 3. Frontend Deployment (if `web/` changed)
- Triggers a Netlify build via build hook.
- Gets the latest deploy ID from Netlify.
- Waits for the deploy to be ready.
- Publishes the deploy using the Netlify API.
