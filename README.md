# ErrorCatcher

> An intelligent error monitoring and analysis system with AI-powered insights

ErrorCatcher is a comprehensive error monitoring platform that helps developers track, analyze, and resolve application errors efficiently. With built-in AI analysis capabilities, it provides intelligent insights and actionable recommendations for error resolution.

## ✨ Features

### 🎯 Core Features
- **Multi-Project Management** - Monitor multiple applications from a single dashboard
- **Real-time Error Tracking** - Capture and track errors as they happen
- **Error Grouping & Deduplication** - Automatically group similar errors using intelligent fingerprinting
- **Issue Management** - Convert errors into trackable issues with status management
- **Advanced Analytics** - Comprehensive dashboards with charts and statistics

### 🤖 AI-Powered Analysis
- **Intelligent Error Analysis** - AI analyzes errors and provides root cause analysis
- **Multiple AI Providers** - Support for OpenAI, DeepSeek, Claude, Gemini, and more
- **Smart Recommendations** - Get actionable fix suggestions and prevention tips
- **Multi-Configuration Support** - Manage multiple AI configurations with easy switching

### 🔔 Alert & Notification System
- **Flexible Alert Rules** - Create custom alert rules based on error patterns
- **Multi-Channel Notifications** - DingTalk, Email, Webhook support
- **Template System** - Customize notification messages with templates
- **Alert History** - Track all triggered alerts and their status

### 👥 Team Collaboration
- **User Management** - Role-based access control (Admin/User)
- **Project Members** - Assign team members to specific projects
- **Activity Tracking** - Monitor all user actions and changes
- **Comments & Discussion** - Collaborate on error resolution

### 🌐 Internationalization
- **Bilingual Support** - Full Chinese and English interface
- **Easy Language Switching** - Switch languages on the fly


## 🏗️ Architecture

```
ErrorCatcher/
├── admin/              # Vue 3 Admin Dashboard
├── api/                # Node.js Backend API
├── examples/           # Integration Examples
├── docs/               # Documentation
├── deploy/             # Deployment Guides
└── src/                # ErrorCatcher SDK
```

### Tech Stack

**Frontend:**
- Vue 3 + Vite
- TailwindCSS
- Vue Router + Pinia
- Axios
- Chart.js

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- WebSocket (Real-time updates)

**AI Integration:**
- OpenAI GPT-4/GPT-5
- Anthropic Claude
- Google Gemini
- DeepSeek
- Alibaba Qwen
- And more...

**DevOps:**
- Docker + Docker Compose
- Nginx
- PM2


## 🚀 Quick Start

### Prerequisites

- Node.js >= 14.x
- MongoDB >= 4.4
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ahkjxy/ErrorCatcher.git
cd ErrorCatcher
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install API dependencies
cd api
npm install

# Install Admin dependencies
cd ../admin
npm install
```

3. **Configure environment variables**
```bash
# API configuration
cp api/.env.example api/.env
# Edit api/.env with your settings

# Admin configuration
cp admin/.env.example admin/.env
# Edit admin/.env with your settings
```

4. **Initialize MongoDB**
```bash
# Import the initialization script
mongosh < mongo-init.js
```

5. **Start the services**
```bash
# Start API server (from api directory)
cd api
npm run dev

# Start Admin dashboard (from admin directory)
cd admin
npm run dev
```

6. **Access the application**
- Admin Dashboard: http://localhost:3000
- API Server: http://localhost:3001
- Default credentials: admin / admin123


## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Access the application**
- Admin Dashboard: http://localhost:3000
- API Server: http://localhost:3001
- MongoDB: localhost:27017

### Services Included
- MongoDB (Database)
- API Server (Backend)
- Admin Dashboard (Frontend)
- Nginx (Reverse Proxy)

For detailed deployment instructions, see [deploy/README.md](deploy/README.md)


## 📦 SDK Integration

### Installation

```bash
npm install error-catcher-sdk
# or
yarn add error-catcher-sdk
```

### Basic Usage

```javascript
import ErrorCatcher from 'error-catcher-sdk';

// Initialize
const errorCatcher = new ErrorCatcher({
  reportUrl: 'http://localhost:3001/api/errors/report',
  apiKey: 'your-project-api-key',
  projectId: 'your-project-id',
  environment: 'production',
  release: '1.0.0',
  debug: false
});

// Errors are automatically captured
// You can also manually report errors
try {
  // Your code
} catch (error) {
  errorCatcher.report(error, {
    type: 'manual',
    tags: { feature: 'payment' },
    extra: { userId: '123' }
  });
}
```

### Configuration Options

```javascript
new ErrorCatcher({
  // Required
  reportUrl: 'http://localhost:3001/api/errors/report',  // Error reporting endpoint
  apiKey: 'your-api-key',                                 // Project API key
  projectId: 'your-project-id',                           // Project ID
  
  // Optional
  environment: 'production',      // Environment name
  release: '1.0.0',              // Release version
  sampleRate: 1,                 // Error sampling rate (0-1)
  maxBatchSize: 10,              // Max errors per batch
  delay: 1000,                   // Batch send delay (ms)
  maxRetries: 3,                 // Max retry attempts
  debug: false,                  // Enable debug logging
  autoStart: true,               // Auto initialize
  autoIntegrate: true,           // Auto detect frameworks
  
  // Framework integration
  vue: null,                     // Vue instance
  react: false,                  // Enable React integration
  axios: null,                   // Axios instance
  jquery: false,                 // Enable jQuery integration
  router: null,                  // Router instance
  
  // Hooks
  beforeSend: (error) => error,  // Modify error before sending
  onError: (error) => {},        // Called when error captured
  
  // Filtering
  ignoreUrls: [                  // URLs to ignore
    /\.(jpg|jpeg|png|gif|svg|css|woff|woff2|ttf|eot)$/i,
    '/favicon.ico'
  ]
});
```

### Framework Integration

**Vue 3**
```javascript
import { createApp } from 'vue';
import ErrorCatcher from 'error-catcher-sdk';
import App from './App.vue';

const app = createApp(App);

// Initialize with Vue instance
new ErrorCatcher({
  reportUrl: 'http://localhost:3001/api/errors/report',
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  vue: app,  // Pass Vue instance
  environment: 'production'
});

app.mount('#app');
```

**Vue 2**
```javascript
import Vue from 'vue';
import ErrorCatcher from 'error-catcher-sdk';

new ErrorCatcher({
  reportUrl: 'http://localhost:3001/api/errors/report',
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  vue: Vue,  // Pass Vue constructor
  environment: 'production'
});

new Vue({
  render: h => h(App)
}).$mount('#app');
```

**React**
```javascript
import ErrorCatcher from 'error-catcher-sdk';

// Initialize at app entry
new ErrorCatcher({
  reportUrl: 'http://localhost:3001/api/errors/report',
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  react: true,
  environment: 'production'
});

// React errors will be captured automatically
```

**Nuxt 3**
```javascript
// plugins/error-catcher.client.js
export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const ErrorCatcher = require('error-catcher-sdk').default;
    
    new ErrorCatcher({
      reportUrl: 'http://localhost:3001/api/errors/report',
      apiKey: 'your-api-key',
      projectId: 'your-project-id',
      vue: nuxtApp.vueApp,
      environment: 'production'
    });
  }
});
```

**Nuxt 2**
```javascript
// plugins/error-catcher.js
import ErrorCatcher from 'error-catcher-sdk';

export default ({ app }, inject) => {
  new ErrorCatcher({
    reportUrl: 'http://localhost:3001/api/errors/report',
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
    vue: app,
    environment: 'production'
  });
};
```

**Axios Integration**
```javascript
import axios from 'axios';
import ErrorCatcher from 'error-catcher-sdk';

new ErrorCatcher({
  reportUrl: 'http://localhost:3001/api/errors/report',
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  axios: axios,  // Pass axios instance
  environment: 'production'
});

// All axios errors will be automatically captured
```

**jQuery**
```javascript
import ErrorCatcher from 'error-catcher-sdk';

new ErrorCatcher({
  reportUrl: 'http://localhost:3001/api/errors/report',
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  jquery: true,  // Enable jQuery integration
  environment: 'production'
});

// All $.ajax errors will be automatically captured
```

### Advanced Usage

**Set User Context**
```javascript
errorCatcher.setUser({
  id: '12345',
  username: 'john_doe',
  email: 'john@example.com'
});
```

**Add Tags**
```javascript
// Single tag
errorCatcher.setTag('page', 'checkout');

// Multiple tags
errorCatcher.setTags({
  feature: 'payment',
  version: '2.0.0'
});
```

**Add Context**
```javascript
errorCatcher.setContext('payment', {
  amount: 99.99,
  currency: 'USD',
  method: 'credit_card'
});
```

**Add Extra Data**
```javascript
errorCatcher.setExtra('orderDetails', {
  orderId: 'ORD-12345',
  items: 3,
  total: 299.97
});
```

**Add Breadcrumbs**
```javascript
errorCatcher.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  level: 'info',
  data: { from: '/cart', to: '/checkout' }
});
```

**Manual Error Reporting**
```javascript
try {
  // Your code
  throw new Error('Something went wrong');
} catch (error) {
  errorCatcher.report(error, {
    type: 'manual',
    tags: { feature: 'payment' },
    extra: { step: 'processing' }
  });
}
```

For more examples, see [examples/](examples/) directory.


## 🤖 AI Configuration

ErrorCatcher supports multiple AI providers for intelligent error analysis.

### Supported AI Providers

- **OpenAI** - GPT-4, GPT-5 series
- **Anthropic** - Claude Opus, Sonnet series
- **Google** - Gemini Pro, Flash series
- **DeepSeek** - Chat, Reasoner models
- **Alibaba** - Qwen series
- **Moonshot** - Kimi models
- **MiniMax** - M2.5 series
- **Stepfun** - Step series
- **NVIDIA** - Nemotron series
- **Zhipu AI** - GLM series
- **xAI** - Grok series

### Configuration Steps

1. Navigate to **AI Configuration** in the admin dashboard
2. Click **Create Configuration**
3. Fill in the configuration details:
   - Configuration Name
   - AI Provider
   - API Key
   - Model Selection
   - API URL (optional)
4. Click **Test Connection** to verify
5. Save and set as default

### Getting API Keys

- OpenAI: https://platform.openai.com/api-keys
- DeepSeek: https://platform.deepseek.com/api_keys
- Claude: https://console.anthropic.com/
- Gemini: https://aistudio.google.com/apikey
- And more...

For detailed AI configuration guide, see [docs/guide/ai-analysis.md](docs/guide/ai-analysis.md)


## 📊 Key Features Explained

### Error Tracking
- Automatic error capture from client-side applications
- Stack trace analysis and source map support
- Error context including user info, device, browser
- Custom tags and metadata
- Error fingerprinting for deduplication

### Issue Management
- Group related errors into issues
- Track issue status (Open, In Progress, Resolved, Closed)
- Assign issues to team members
- Add comments and discussions
- Issue timeline and activity history

### Analytics Dashboard
- Real-time error statistics
- Error trends and patterns
- Top errors by frequency
- Error distribution by browser, OS, device
- Custom date range filtering
- Export data capabilities

### Alert System
- Create custom alert rules
- Trigger conditions:
  - Error count threshold
  - Error rate increase
  - Specific error patterns
  - New error types
- Multiple notification channels
- Alert history and tracking
- Customizable notification templates

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication for SDK
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection


## 🔧 Configuration

### Environment Variables

**API Server (api/.env)**
```env
# Server
PORT=3001
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/errorcatcher

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Admin Dashboard (admin/.env)**
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Environment
VITE_ENV=production
VITE_APP_NAME=ErrorCatcher
```

For complete configuration options, see:
- [api/ENV_GUIDE.md](api/ENV_GUIDE.md)
- [admin/ENV_GUIDE.md](admin/ENV_GUIDE.md)


## 📚 Documentation

- [Getting Started Guide](docs/guide/getting-started.md)
- [Installation Guide](docs/guide/installation.md)
- [API Reference](docs/api/README.md)
- [Framework Integration](docs/frameworks/index.md)
  - [Vue 2/3](docs/frameworks/vue3.md)
  - [React](docs/frameworks/react.md)
  - [Nuxt 2/3](docs/frameworks/nuxt3.md)
  - [Next.js](docs/frameworks/nextjs.md)
- [AI Analysis Guide](docs/guide/ai-analysis.md)
- [Deployment Guide](deploy/README.md)
- [Best Practices](docs/guide/best-practices.md)

## 🛠️ Development

### Project Structure
```
ErrorCatcher/
├── admin/                  # Admin Dashboard (Vue 3)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── views/         # Page components
│   │   ├── stores/        # Pinia stores
│   │   ├── router/        # Vue Router
│   │   └── i18n/          # Internationalization
│   └── package.json
│
├── api/                    # Backend API (Node.js)
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
│   └── package.json
│
├── src/                    # ErrorCatcher SDK
│   ├── core/              # Core functionality
│   └── index.js           # SDK entry point
│
├── examples/               # Integration examples
│   ├── vue3/
│   ├── react/
│   ├── nuxt3/
│   └── ...
│
└── docs/                   # Documentation
```

### Running Tests
```bash
# API tests
cd api
npm test

# Admin tests
cd admin
npm test
```

### Building for Production
```bash
# Build Admin Dashboard
cd admin
npm run build

# Build SDK
npm run build
```


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Sentry and other error tracking platforms
- Built with modern web technologies
- Community contributions and feedback

## 📧 Contact & Support

- GitHub Issues: [https://github.com/ahkjxy/ErrorCatcher/issues](https://github.com/ahkjxy/ErrorCatcher/issues)
- Documentation: [https://github.com/ahkjxy/ErrorCatcher/tree/main/docs](https://github.com/ahkjxy/ErrorCatcher/tree/main/docs)

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

Made with ❤️ by the ErrorCatcher Team
