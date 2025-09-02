#!/bin/bash
set -e

PROJECT_ID="ui-aic"
REGION="asia-southeast2" 
MODEL_NAME="yolo-person-detector"
ENDPOINT_NAME="yolo-person-endpoint"
IMAGE_NAME="yolo-vertex-day-philipine"
REPOSITORY="vertex-ai-models"
MODEL_FILE=${MODEL_FILE:-"export/Day_Philipine_fp32.onnx"}

# Optional CLI overrides
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--model-file)
      MODEL_FILE="$2"; shift 2;;
    -p|--project)
      PROJECT_ID="$2"; shift 2;;
    -r|--region)
      REGION="$2"; shift 2;;
    *) echo "Unknown argument: $1"; exit 1;;
  esac
done

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
SA="service-$PROJECT_NUMBER@gcp-sa-aiplatform.iam.gserviceaccount.com"

echo "🚀 Deploying YOLO model to Vertex AI Endpoints"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Model file: $MODEL_FILE"

echo "📋 Enabling required APIs..."
gcloud services enable aiplatform.googleapis.com --project=$PROJECT_ID
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

echo "🏗️  Creating Artifact Registry repository..."
gcloud artifacts repositories create $REPOSITORY \
    --repository-format=docker \
    --location=$REGION \
    --project=$PROJECT_ID \
    --quiet || echo "Repository already exists"

# Grant repo-level read to Vertex AI service agent (after repo exists)
gcloud artifacts repositories add-iam-policy-binding "$REPOSITORY" \
  --location="$REGION" \
  --member="serviceAccount:$SA" \
  --role="roles/artifactregistry.reader" || true

echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

echo "🐳 Building container image..."
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"

# Ensure buildx is available
if ! docker buildx inspect >/dev/null 2>&1; then
  docker buildx create --use >/dev/null 2>&1 || true
fi

# Cross-build for Vertex AI runtime (x86_64)
docker buildx build \
  --platform linux/amd64 \
  -f Dockerfile.vertex \
  -t $IMAGE_URI \
  --build-arg MODEL_FILE="$MODEL_FILE" \
  --push \
  .

echo "✅ Image pushed: $IMAGE_URI"

echo "📤 Uploading model to Vertex AI..."
MODEL_UPLOAD_ARGS=(
    --region="$REGION"
    --project="$PROJECT_ID"
    --display-name="$MODEL_NAME"
    --container-image-uri="$IMAGE_URI"
    --container-health-route=/health
    --container-predict-route=/predict
    --container-ports=8080
    --quiet
)
gcloud ai models upload "${MODEL_UPLOAD_ARGS[@]}"

MODEL_ID=$(gcloud ai models list \
    --region=$REGION \
    --project=$PROJECT_ID \
    --filter="displayName:$MODEL_NAME" \
    --format="value(name)" \
    --sort-by="~createTime" \
    --limit=1)

echo "✅ Model uploaded: $MODEL_ID"

echo "🎯 Creating Vertex AI endpoint..."
gcloud ai endpoints create \
    --region=$REGION \
    --project=$PROJECT_ID \
    --display-name=$ENDPOINT_NAME \
    --quiet

# Get the endpoint ID
ENDPOINT_ID=$(gcloud ai endpoints list \
    --region=$REGION \
    --project=$PROJECT_ID \
    --filter="displayName:$ENDPOINT_NAME" \
    --format="value(name)" \
    --sort-by="~createTime" \
    --limit=1)

echo "✅ Endpoint created: $ENDPOINT_ID"

echo "🚀 Deploying model to endpoint..."
gcloud ai endpoints deploy-model $ENDPOINT_ID \
    --region=$REGION \
    --project=$PROJECT_ID \
    --model=$MODEL_ID \
    --display-name="${MODEL_NAME}-deployment" \
    --machine-type=n1-standard-4 \
    --min-replica-count=1 \
    --max-replica-count=1 \
    --quiet

echo "🎉 Deployment complete!"
echo ""
echo "📋 Summary:"
echo "  Model: $MODEL_ID"
echo "  Endpoint: $ENDPOINT_ID"
echo "  Image: $IMAGE_URI"
echo ""
echo "🧪 Test your endpoint:"
echo "  gcloud ai endpoints predict $ENDPOINT_ID \\"
echo "    --region=$REGION \\"
echo "    --project=$PROJECT_ID \\"
echo "    --json-request=test_request.json"
echo ""
echo "💰 Cost optimization:"
echo "  - min_replica_count=0 means you only pay when serving requests"
echo "  - Endpoint will auto-scale from 0 to 10 replicas based on demand"
