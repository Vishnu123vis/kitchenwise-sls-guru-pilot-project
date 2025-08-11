# 🚀 KitchenWise Deployment Setup Guide

## 📋 **Prerequisites**
- AWS Account with appropriate permissions
- Amplify Console access
- API keys for OpenAI and Pexels

## 🔧 **Required Environment Variables**

### **Backend Environment Variables (Serverless Functions)**
The following environment variables must be configured in your `.env` file:

```bash
# OpenAI API Key for recipe generation
OPENAI_API_KEY=your_actual_openai_api_key

# Pexels API Key for image search  
PEXELS_API_KEY=your_actual_pexels_api_key

# AWS Profile (optional)
AWS_PROFILE=default

# Stage (optional, defaults to 'dev')
STAGE=dev
```

### **Frontend Environment Variables (Amplify Console)**
Configure these in Amplify Console → Hosting → Environment Variables:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_ENDPOINT=https://ni7czy4s82.execute-api.us-east-2.amazonaws.com
NEXT_PUBLIC_USER_POOL_ID=us-east-2_Z5syjm4tX
NEXT_PUBLIC_USER_POOL_CLIENT_ID=1t2aot59eh6p5f
NEXT_PUBLIC_IDENTITY_POOL_ID=us-east-2:c33fa38b-4d39-48b4-a55d-175635bf8071
NEXT_PUBLIC_REGION=us-east-2
```

## 🏗️ **Deployment Configuration**

### **1. Backend Deployment (Serverless Framework)**
```bash
cd backend
npm install
npm run deploy:dev  # or npm run deploy:prod
```

### **2. Frontend Deployment (Amplify Console)**
The `amplify.yml` file is configured to:
- Install all dependencies (including dev dependencies)
- Generate backend outputs automatically
- Build the Next.js application
- Cache dependencies for faster builds

### **3. Backend Environment Association**
To associate the Gen 2 backend with your branch:
1. Ensure your `/amplify` folder is committed
2. In Amplify Console, enable full-stack CI/CD for the branch
3. The CI will automatically generate `amplify_outputs.json`

## 🔐 **Secrets Management**

### **Option 1: Amplify Console Environment Variables**
- Go to Amplify Console → Your App → Environment Variables
- Add each variable with appropriate values
- Scope to specific branches or "all branches"

### **Option 2: AWS Systems Manager Parameter Store**
Store secrets in SSM Parameter Store under:
```
/amplify/d2o1zmjfetjbs5/main/
```

Required parameters:
- `/amplify/d2o1zmjfetjbs5/main/OPENAI_API_KEY`
- `/amplify/d2o1zmjfetjbs5/main/PEXELS_API_KEY`

## 🚨 **Troubleshooting**

### **Build Failures**
1. **TypeScript errors**: Ensure all dev dependencies are installed
2. **Backend outputs missing**: Run `npx ampx generate outputs` locally
3. **Environment variables**: Check Amplify Console configuration

### **Runtime Errors**
1. **API calls failing**: Verify backend is deployed and accessible
2. **Authentication issues**: Check Cognito configuration in `amplify_outputs.json`
3. **Database errors**: Ensure DynamoDB tables exist and IAM permissions are correct

## 📚 **Additional Resources**
- [Amplify Gen 2 Documentation](https://docs.amplify.aws/)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
