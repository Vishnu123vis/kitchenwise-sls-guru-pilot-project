# 🍳 KitchenWise

A smart pantry management application with Next.js frontend and Serverless Framework backend.

## 🏗️ Project Structure

```
KitchenWise/
├── frontend/          # Next.js 15.3.4 application
├── backend/           # Serverless Framework (AWS Lambda, DynamoDB, Cognito)
├── amplify.yml        # AWS Amplify monorepo configuration
├── package.json       # Root package.json with build scripts
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- AWS CLI configured
- Serverless Framework CLI
- AWS Amplify CLI

### Installation

```bash
# Install all dependencies (root, frontend, and backend)
npm run install:all

# Or install individually:
npm install
cd frontend && npm install
cd backend && npm install
```

### Development

```bash
# Start frontend development server
npm run dev:frontend

# Start backend development server (Serverless Offline)
npm run dev:backend

# Or run both in separate terminals
```

## 🚀 Deployment

### Backend Deployment

```bash
# Deploy backend to AWS
npm run deploy:backend

# Or manually:
cd backend
serverless deploy
```

### Frontend Deployment

The frontend deploys automatically via AWS Amplify when you push to your Git repository.

1. **Connect your repository to AWS Amplify**
2. **Configure build settings** using the provided `amplify.yml`
3. **Push changes** to trigger automatic deployment

```bash
# Commit and push changes
git add .
git commit -m "Your commit message"
git push origin main
```

### Full Deployment

```bash
# Deploy both backend and frontend
npm run deploy:all
```

## 📁 Monorepo Configuration

### Build Scripts

- `npm run build:frontend` - Build Next.js frontend
- `npm run build:backend` - Build Serverless backend
- `npm run deploy:backend` - Deploy backend to AWS
- `npm run deploy:all` - Deploy both frontend and backend
- `npm run dev:frontend` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm run install:all` - Install dependencies for all packages

### AWS Amplify Configuration

The `amplify.yml` file configures the monorepo deployment:

```yaml
version: 1
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
```

## 🔧 Environment Configuration

### Frontend Environment Variables

Set these in AWS Amplify Console:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=your-api-gateway-url
```

### Backend Environment Variables

Configured in `backend/serverless.yml`:

```yaml
environment:
  DYNAMODB_PANTRY_TABLE: ${self:service}-pantry-items-${sls:stage}
  DYNAMODB_STARRED_RECIPES_TABLE: ${self:service}-starred-recipes-${sls:stage}
  OPENAI_API_KEY: your-openai-api-key
  PEXELS_API_KEY: your-pexels-api-key
```

## 🛠️ Development Workflow

### Making Changes

1. **Frontend Changes:**
   ```bash
   cd frontend
   # Make your changes
   git add .
   git commit -m "Update frontend: [description]"
   git push origin main
   # Amplify automatically deploys
   ```

2. **Backend Changes:**
   ```bash
   cd backend
   # Make your changes
   serverless deploy
   git add .
   git commit -m "Update backend: [description]"
   git push origin main
   ```

3. **Coordinated Changes:**
   ```bash
   # Make changes in both directories
   git add .
   git commit -m "Feature: [description] - frontend and backend updates"
   git push origin main
   ```

## 📚 API Endpoints

### Backend API (Serverless Framework)

- `GET /pantry/items` - Get pantry items
- `POST /pantry/items` - Create pantry item
- `PUT /pantry/items/{id}` - Update pantry item
- `DELETE /pantry/items/{id}` - Delete pantry item
- `GET /dashboard/stats` - Get dashboard statistics
- `POST /recipes/generate` - Generate recipe with AI

### Authentication

Uses AWS Cognito for user authentication.

## 🏗️ Architecture

- **Frontend**: Next.js 15.3.4 with TypeScript
- **Backend**: Serverless Framework with AWS Lambda
- **Database**: Amazon DynamoDB
- **Authentication**: AWS Cognito
- **Hosting**: AWS Amplify (Frontend) + API Gateway (Backend)
- **AI Integration**: OpenAI API for recipe generation
- **Image Search**: Pexels API for recipe images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License 