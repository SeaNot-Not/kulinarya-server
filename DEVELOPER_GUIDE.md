# Kulinarya Developer Guide

## 📚 Overview

This guide provides comprehensive information for developers working on the Kulinarya backend. It covers code organization, development workflows, testing, and contribution guidelines.

## 🏗️ Project Structure

### Core Architecture
```
src/
├── app.js                    # Express app configuration
├── config/                   # Configuration files
├── controllers/              # Business logic handlers
├── middleware/               # Custom middleware
├── models/                   # MongoDB schemas with business logic
├── routes/                   # API route definitions
├── utils/                    # Utility functions
├── validations/              # Zod validation schemas
└── mail/                     # Email templates
```

### Key Design Patterns

#### 1. Repository Pattern
Models contain business logic and data access methods:

```javascript
// Example from userModel.js
userSchema.statics.signup = async function (signupCredentials) {
  const { email } = signupCredentials;
  
  // Validate user data
  registerUserSchema.parse(signupCredentials);
  
  const isEmailExists = await this.findOne({ email });
  if (isEmailExists) throw new CustomError("Email is already in use!", 400);
  
  return await this.create(signupCredentials);
};
```

#### 2. Middleware Chain Pattern
```javascript
// Route definition example
router.post(
  "/register",
  validateRequest(registerUserSchema),  // Validation middleware
  userRegistration                      // Controller
);

// Error handling middleware
app.use(errorHandler);
```

#### 3. Service Layer Pattern
Utility functions handle cross-cutting concerns:
```javascript
// File upload service
const handleSupabaseUpload = async ({ file, folder, allowedTypes, maxFileSize }) => {
  // Validation, processing, and upload logic
};
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Git
- VS Code (recommended)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd server

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### VS Code Extensions
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **MongoDB for VS Code**: Database management
- **Thunder Client**: API testing
- **GitLens**: Git integration

## 📝 Code Style Guidelines

### Naming Conventions
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Files**: `kebab-case.js`

### File Structure
```javascript
// Model file structure
import { Schema, model } from "mongoose";
import "dotenv/config";

// 1. Imports
import CustomError from "../utils/customError.js";
import { validateObjectId } from "../utils/validators.js";

// 2. Schema definition
const userSchema = new Schema(
  {
    // Fields with validation
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // ... other fields
  },
  { timestamps: true }
);

// 3. Pre-save hooks
userSchema.pre("save", async function (next) {
  // Hashing, formatting, etc.
});

// 4. Static methods
userSchema.statics.signup = async function (signupCredentials) {
  // Business logic
};

// 5. Instance methods
userSchema.methods.generateAuthToken = function (res) {
  // Token generation
};

// 6. Export
const User = model("User", userSchema);
export default User;
```

### Error Handling
```javascript
// Use CustomError class
import CustomError from "../utils/customError.js";

// Throw specific errors
throw new CustomError("User not found", 404);
throw new CustomError("Invalid credentials", 401);
throw new CustomError("Validation failed", 422);

// Global error handler in middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
```

### Validation
```javascript
// Use Zod for validation
import { z } from "zod";

const registerUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
});

// In controller
registerUserSchema.parse(req.body);
```

## 🔧 Adding New Features

### Step 1: Define the Model
```javascript
// src/models/newModel.js
import { Schema, model } from "mongoose";

const newSchema = new Schema(
  {
    // Define fields
    name: {
      type: String,
      required: true,
    },
    // ... other fields
  },
  { timestamps: true }
);

// Add static methods
newSchema.statics.createNew = async function (data) {
  // Business logic
};

export default model("New", newSchema);
```

### Step 2: Create Validation Schema
```javascript
// src/validations/newValidation.js
import { z } from "zod";

export const createNewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // ... other validations
});

export const updateNewSchema = createNewSchema.partial();
```

### Step 3: Create Controller
```javascript
// src/controllers/newController.js
import New from "../models/newModel.js";
import { createNewSchema } from "../validations/newValidation.js";
import CustomError from "../utils/customError.js";

export const createNew = asyncHandler(async (req, res) => {
  // Validate request
  createNewSchema.parse(req.body);
  
  // Business logic
  const newItem = await New.createNew(req.body);
  
  // Response
  res.status(201).json({
    message: "New item created successfully",
    data: newItem,
  });
});

// ... other controller methods
```

### Step 4: Create Routes
```javascript
// src/routes/newRoutes.js
import express from "express";
import { createNew, getNew, updateNew, deleteNew } from "../controllers/newController.js";
import authenticateUser from "../middleware/authenticateUser.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

router.post("/", authenticateUser, createNew);
router.get("/:id", getNew);
router.put("/:id", authenticateUser, updateNew);
router.delete("/:id", authenticateUser, checkRole(["admin"]), deleteNew);

export default router;
```

### Step 5: Register Routes
```javascript
// src/app.js
import newRoutes from "./routes/newRoutes.js";

// Add to routes section
app.use("/api/news", newRoutes);
```

## 🧪 Testing

### Unit Testing Setup
```javascript
// test/userModel.test.js
import User from "../src/models/userModel.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("User Model", () => {
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  test("should create a new user", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };
    
    const user = await User.signup(userData);
    expect(user.email).toBe(userData.email);
    expect(user.isEmailVerified).toBe(false);
  });
});
```

### API Testing with Bruno
The project includes a Bruno API collection in `/kulinarya-api/`. To use it:

1. Install Bruno: `npm install -g @usebruno/cli`
2. Import the collection
3. Set environment variables
4. Run tests: `bruo run kulinarya-api`

### Manual Testing Checklist
- [ ] Authentication flows
- [ ] CRUD operations
- [ ] File uploads
- [ ] Validation errors
- [ ] Error handling
- [ ] Pagination
- [ ] Search and filtering

## 🔍 Debugging

### Common Issues and Solutions

#### 1. Database Connection Issues
```javascript
// Check MongoDB connection
mongoose.connection.on("connected", () => {
  console.log("MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err);
});

// Enable debug logging
mongoose.set("debug", process.env.NODE_ENV === "development");
```

#### 2. File Upload Problems
```javascript
// Debug Multer middleware
console.log("Request files:", req.files);
console.log("Request body:", req.body);

// Check file validation
const allowedTypes = ["jpeg", "png", "jpg", "webp"];
const maxFileSize = 2 * 1024 * 1024; // 2MB
```

#### 3. Authentication Issues
```javascript
// Debug JWT tokens
console.log("Request cookies:", req.cookies);
console.log("Decoded user:", req.user);

// Check token expiration
const token = jwt.verify(token, process.env.JWT_SECRET);
console.log("Token expires:", new Date(token.exp * 1000));
```

### Logging Strategy
```javascript
// Development logging
if (process.env.NODE_ENV === "development") {
  console.log("DEBUG:", {
    endpoint: req.originalUrl,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body,
    user: req.user,
  });
}

// Production logging
const logger = {
  info: (message, data) => console.log(JSON.stringify({ level: "info", message, data })),
  error: (message, error) => console.error(JSON.stringify({ level: "error", message, error: error.message, stack: error.stack })),
  warn: (message, data) => console.warn(JSON.stringify({ level: "warn", message, data })),
};
```

## 📈 Performance Optimization

### Database Optimization

#### Indexing Strategy
```javascript
// Add indexes for common queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ deletedAt: 1 });

recipeSchema.index({ byUser: 1, status: 1 });
recipeSchema.index({ foodCategory: 1, originProvince: 1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ isFeatured: 1, status: 1 });
```

#### Query Optimization
```javascript
// Use lean() for read-only queries
const users = await User.find({ role: "user" }).lean();

// Use select() to limit fields
const user = await User.findById(userId).select("email firstName lastName");

// Use pagination for large datasets
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const recipes = await Recipe.find(query)
  .skip(skip)
  .limit(limit)
  .lean();
```

#### Aggregation Pipelines
```javascript
// Use aggregation for complex queries
const topSharers = await User.aggregate([
  { $match: { deletedAt: null } },
  {
    $lookup: {
      from: "recipes",
      localField: "_id",
      foreignField: "byUser",
      as: "recipes",
    },
  },
  { $unwind: "$recipes" },
  // ... more stages
]);
```

### Caching Strategy

#### Redis Implementation Example
```javascript
// src/utils/cache.js
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  get: async (key) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  set: async (key, value, ttl = 3600) => {
    await redis.setex(key, ttl, JSON.stringify(value));
  },
  
  del: async (key) => {
    await redis.del(key);
  },
};

// Usage in controller
export const getFeaturedRecipes = asyncHandler(async (req, res) => {
  const cacheKey = `featured_recipes_${req.query.page}_${req.query.limit}`;
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from database
  const recipes = await Recipe.getFeaturedRecipes(req.query);
  
  // Cache for 5 minutes
  await cache.set(cacheKey, recipes, 300);
  
  res.json(recipes);
});
```

## 🔄 Database Migrations

### Schema Changes
```javascript
// Migration script example
const migrateUsers = async () => {
  // Add new field with default value
  await User.updateMany(
    { bio: { $exists: false } },
    { $set: { bio: "" } }
  );
  
  // Rename field
  await User.updateMany(
    {},
    { $rename: { "oldField": "newField" } }
  );
  
  // Remove field
  await User.updateMany(
    {},
    { $unset: { "deprecatedField": "" } }
  );
};
```

### Data Migration
```javascript
// Batch processing for large datasets
const batchSize = 1000;
let skip = 0;
let hasMore = true;

while (hasMore) {
  const users = await User.find({})
    .skip(skip)
    .limit(batchSize)
    .lean();
  
  if (users.length === 0) {
    hasMore = false;
    break;
  }
  
  // Process batch
  for (const user of users) {
    // Migration logic
    await User.findByIdAndUpdate(user._id, {
      $set: { migratedField: "value" },
    });
  }
  
  skip += batchSize;
  console.log(`Processed ${skip} users`);
}
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Run tests: `npm test`
- [ ] Check linting: `npm run lint`
- [ ] Update dependencies: `npm outdated`
- [ ] Update documentation
- [ ] Backup database

### Deployment Steps
1. **Merge to main branch**
2. **Run CI/CD pipeline**
3. **Deploy to staging**
4. **Run smoke tests**
5. **Deploy to production**
6. **Monitor for issues**

### Post-Deployment
- [ ] Verify health checks
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Update deployment documentation

## 📚 API Documentation

### Generating Documentation
```bash
# Install documentation generator
npm install -g apidoc

# Generate documentation
apidoc -i src/ -o docs/
```

### Documentation Standards
```javascript
/**
 * @api {POST} /api/auth/register Register User
 * @apiName RegisterUser
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiBody {String} email User email
 * @apiBody {String} password User password
 * @apiBody {String} firstName User first name
 * @apiBody {String} lastName User last name
 * @apiBody {String} [middleName] User middle name
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {Object} data User data
 * @apiSuccess {String} data._id User ID
 * @apiSuccess {String} data.email User email
 *
 * @apiError (400) {String} error Validation error
 * @apiError (409) {String} error Email already exists
 */
export const userRegistration = asyncHandler(async (req, res) => {
  // Implementation
});
```

## 🤝 Contribution Guidelines

### Workflow
1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make changes**
4. **Write tests**
5. **Update documentation**
6. **Submit pull request**

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance considered
- [ ] Error handling implemented

### Commit Message Convention
```
type(scope): description

feat(auth): add email verification
fix(recipes): fix file upload validation
docs(readme): update installation instructions
style: format code with prettier
refactor(users): extract validation logic
test(auth): add login tests
chore: update dependencies
```

## 🔒 Security Best Practices

### Input Validation
```javascript
// Always validate input
const validateInput = (data, schema) => {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new CustomError(error.errors[0].message, 422);
  }
};

// Sanitize user input
const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, "");
};
```

### Authentication Security
```javascript
// Secure cookie settings
res.cookie("kulinarya_auth_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Password hashing
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

### Rate Limiting
```javascript
// Implement rate limiting
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many attempts, please try again later",
});

app.use("/api/auth/login", authLimiter);
```

## 📊 Monitoring and Metrics

### Health Check Endpoints
```javascript
// Add health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: process.memoryUsage(),
  });
});
```

### Performance Metrics
```javascript
// Add response time logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
});
```

## 🆘 Getting Help

### Common Problems
1. **Database connection refused**
   - Check MongoDB service status
   - Verify connection string
   - Check firewall settings

2. **File upload fails**
   - Check Supabase credentials
   - Verify bucket permissions
   - Check file size limits

3. **Email not sending**
   - Verify SMTP configuration
   - Check email service status
   - Review email logs

### Debugging Tools
- **Node.js Inspector**: `node --inspect server.js`
- **MongoDB Compass**: GUI for database
- **Postman/Bruno**: API testing
- **Winston**: Structured logging

### Support Channels
- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: This guide and API docs
- **Code Review**: Peer review process
- **Team Chat**: Development team communication

---

*This developer guide provides comprehensive information for working with the Kulinarya backend. Always refer to the latest code and documentation for the most up-to-date information.*