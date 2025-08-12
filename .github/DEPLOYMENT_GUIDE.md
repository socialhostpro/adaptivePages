# Google Cloud Deployment Guide - AdaptivePages

## Migration from Container Registry to Artifact Registry

Google Container Registry (GCR) is deprecated. Use Artifact Registry instead.

### Setup Artifact Registry

First, enable Artifact Registry API and create a repository:

```bash
# Enable the API
gcloud services enable artifactregistry.googleapis.com

# Create a repository
gcloud artifacts repositories create adaptivepages \
    --repository-format=docker \
    --location=us-central1 \
    --description="AdaptivePages Docker repository"

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Build and Deploy Commands

```bash
# Build and submit to Artifact Registry
gcloud builds submit --tag us-central1-docker.pkg.dev/imaginecapitalai/adaptivepages/app:latest

# Deploy to Cloud Run
gcloud run deploy adaptive-pages \
    --image us-central1-docker.pkg.dev/imaginecapitalai/adaptivepages/app:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated
```

### Migration Command (if needed)

If you have existing images in GCR, run this to migrate:

```bash
gcloud artifacts docker upgrade migrate --projects=imaginecapitalai
```

### Current Service Details

- **Service**: adaptive-pages 
- **Region**: us-central1 
- **URL**: https://adaptive-pages-546954721368.us-central1.run.app
- **Scaling**: Auto (Min: 0)

### Troubleshooting

If you get permission errors, ensure you have the required roles:
- Artifact Registry Admin
- Cloud Build Service Account
- Cloud Run Admin

### Quick Deploy Script

```bash
#!/bin/bash
# Quick deploy script
gcloud builds submit --tag us-central1-docker.pkg.dev/imaginecapitalai/adaptivepages/app:$(date +%Y%m%d%H%M%S) && \
gcloud run deploy adaptive-pages \
    --image us-central1-docker.pkg.dev/imaginecapitalai/adaptivepages/app:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated
```
