# 🍳 KitchenWise - Smart Kitchen Management System

![KitchenWise Architecture](https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=KitchenWise+Architecture+Diagram)

> **A serverless application that helps you manage your pantry inventory and generate personalized recipes using AI**

## 🚀 Overview

KitchenWise is a comprehensive kitchen management system built with AWS serverless architecture. It combines pantry inventory management with AI-powered recipe generation, helping users make the most of their available ingredients while reducing food waste.

## ✨ Key Features

### 🥘 **Smart Recipe Generation**
- **AI-Powered**: Uses OpenAI GPT-3.5 to generate personalized recipes
- **Pantry-Based**: Creates recipes using only ingredients you have
- **Dietary Constraints**: Supports vegetarian, vegan, gluten-free, and more
- **Visual Appeal**: Automatically finds recipe images via Pexels API

### 📦 **Pantry Management**
- **Complete CRUD Operations**: Add, edit, delete, and view pantry items
- **Smart Categorization**: Organize by type (Dairy, Produce, Meat, etc.)
- **Location Tracking**: Track where items are stored (Fridge, Freezer, Pantry, etc.)
- **Expiry Alerts**: Get notified when items are about to expire

### ⭐ **Recipe Starring System**
- **Temporary Recipes**: Generated recipes auto-delete after 30 days
- **Permanent Storage**: Star recipes to save them forever
- **TTL Management**: Automatic cleanup of unused recipes

### 📊 **Dashboard Analytics**
- **Inventory Insights**: Track total items, low stock alerts
- **Location Breakdown**: See which storage areas are most populated
- **Expiry Tracking**: Monitor items expiring in 7, 14, and 30 days
- **Type Analysis**: Understand your pantry composition

## 🏗️ Architecture

### **Frontend (Next.js + TypeScript)**
- **Modern UI**: Responsive design with CSS modules
- **Authentication**: AWS Cognito integration
- **API Integration**: AWS Amplify for seamless backend communication

### **Backend (AWS Serverless)**
- **API Gateway**: RESTful API endpoints
- **Lambda Functions**: Serverless compute for business logic
- **DynamoDB**: NoSQL database with TTL support
- **Secrets Manager**: Secure API key management

### **External Services**
- **OpenAI**: Recipe generation and content creation
- **Pexels**: High-quality recipe images
- **AWS Cognito**: User authentication and authorization

## 🔧 Tech Stack

### **Frontend**
- **Framework**: Next.js 14 with TypeScript
- **Styling**: CSS Modules
- **Authentication**: AWS Amplify Auth
- **API Client**: AWS Amplify REST API

### **Backend**
- **Runtime**: Node.js 20.x
- **Framework**: AWS Lambda + Serverless Framework
- **Database**: Amazon DynamoDB
- **API Gateway**: HTTP API
- **Secrets**: AWS Secrets Manager
- **Authentication**: Amazon Cognito

### **External APIs**
- **OpenAI**: GPT-3.5-turbo for recipe generation
- **Pexels**: Image search and retrieval

## 📁 Project Structure

```
KitchenWise/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # React components
│   │   ├── types/           # TypeScript type definitions
│   │   └── hooks/           # Custom React hooks
│   └── public/              # Static assets
├── backend/                 # Serverless backend
│   ├── src/
│   │   ├── functions/       # Lambda function handlers
│   │   ├── libs/            # Shared utility libraries
│   │   └── types/           # TypeScript type definitions
│   ├── serverlessConfigs/   # Serverless configuration
│   └── tests/               # Unit tests
└── amplify/                 # AWS Amplify configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured
- Serverless Framework installed globally

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/KitchenWise.git
   cd KitchenWise
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure AWS credentials**
   ```bash
   aws configure
   ```

5. **Deploy the backend**
   ```bash
   cd backend
   serverless deploy
   ```

6. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## 🔑 Environment Setup

### Backend Environment Variables
```bash
# AWS Secrets Manager
OPENAI_API_KEY=your_openai_api_key
PEXELS_API_KEY=your_pexels_api_key

# DynamoDB Tables
DYNAMODB_PANTRY_TABLE=KitchenWise-pantry-items-dev
DYNAMODB_STARRED_RECIPES_TABLE=KitchenWise-starred-recipes-dev
```

### Frontend Configuration
The frontend automatically configures itself using `amplify_outputs.json` generated during deployment.

## 📊 Database Schema

### Pantry Items Table
```typescript
interface PantryItemRecord {
  userId: string;           // Partition Key
  sortKey: string;          // Sort Key (TYPE#LOCATION#ITEMID)
  itemId: string;           // Unique item identifier
  title: string;            // Item name (max 50 chars)
  type: PantryItemType;     // Dairy, Produce, Meat, etc.
  location: PantryLocation; // Fridge, Freezer, Pantry, etc.
  expiryDate: string;       // ISO date string
  count: number;            // Quantity (≥ 1)
  notes?: string;           // Optional notes (max 200 chars)
}
```

### Starred Recipes Table
```typescript
interface StarredRecipeRecord {
  userId: string;           // Partition Key
  recipeId: string;         // Sort Key
  title: string;            // Recipe name
  description: string;      // Recipe instructions
  imageUrl: string;         // Pexels image URL
  constraint: string;       // Dietary constraint used
  status: 'temporary' | 'permanent';
  ttlExpiration?: number;   // Unix timestamp (only for temporary)
}
```

## 🔄 API Endpoints

### Pantry Management
- `GET /pantry-items` - Get all pantry items
- `POST /pantry-items` - Create new pantry item
- `GET /pantry-items/{itemId}` - Get specific item
- `PUT /pantry-items/{itemId}` - Update item
- `DELETE /pantry-items/{itemId}` - Delete item

### Recipe Management
- `POST /recipes/generate` - Generate new recipe
- `POST /starred-recipes` - Star/unstar recipe
- `GET /starred-recipes` - Get starred recipes
- `GET /starred-recipes/{recipeId}` - Get specific recipe

### Analytics
- `GET /dashboard/stats` - Get dashboard statistics

## 🔐 Authentication & Security

- **AWS Cognito**: User authentication and JWT tokens
- **API Gateway**: Request validation and rate limiting
- **IAM Roles**: Least privilege access for Lambda functions
- **Secrets Manager**: Secure storage of API keys
- **DynamoDB**: User data isolation via partition keys

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Performance & Scalability

- **Serverless Architecture**: Auto-scaling based on demand
- **DynamoDB**: Single-digit millisecond latency
- **API Gateway**: Handles thousands of concurrent requests
- **Lambda**: Cold start optimization with provisioned concurrency
- **Caching**: 5-minute cache for API keys in Secrets Manager

## 🔧 Development

### Adding New Features
1. Create Lambda function in `backend/src/functions/`
2. Add API endpoint in `serverlessConfigs/functions.yml`
3. Create frontend API client in `frontend/src/api/`
4. Add React component in `frontend/src/components/`
5. Update types in respective `types/` folders

### Code Quality
- **TypeScript**: Full type safety across frontend and backend
- **ESLint**: Code linting and formatting
- **Jest**: Unit testing framework
- **Git Hooks**: Pre-commit validation

## 🚀 Deployment

### Production Deployment
```bash
# Deploy backend
cd backend
serverless deploy --stage prod

# Deploy frontend
cd frontend
npm run build
npm run export
# Deploy to your hosting platform (Vercel, Netlify, etc.)
```

### Environment Management
- **Development**: `dev` stage with sandbox resources
- **Production**: `prod` stage with production-grade resources
- **Staging**: `staging` stage for testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for powerful recipe generation capabilities
- **Pexels** for high-quality recipe images
- **AWS** for robust serverless infrastructure
- **Serverless Framework** for simplified deployment

## 📞 Support

For support, email support@kitchenwise.com or create an issue in this repository.

---

**Built with ❤️ using AWS Serverless Architecture**