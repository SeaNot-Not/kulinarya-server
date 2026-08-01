# Kulinarya Backend Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Supabase account (for file storage)
- SMTP email service (Resend recommended)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # Database
   MONGO_URI_DEV=mongodb://localhost:27017/kulinarya
   MONGO_URI_PROD=your_production_mongo_uri
   
   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   
   # Client URLs
   CLIENT_URL_DEV=http://localhost:3000
   CLIENT_URL_PROD=your_production_client_url
   
   # Email Configuration
   EMAIL_HOST=smtp.resend.com
   EMAIL_PORT=465
   EMAIL_USER=your_resend_api_key
   EMAIL_PASSWORD=your_resend_api_key
   EMAIL_FROM=noreply@kulinarya.com
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_BUCKET_NAME=your_bucket_name
   
   # Initial Admin
   INITIAL_ADMIN_EMAIL=admin@kulinarya.com
   INITIAL_ADMIN_PASSWORD=admin_password_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the API**
   ```
   http://localhost:4000
   ```

## 🐳 Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: kulinarya-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db

  app:
    build: .
    container_name: kulinarya-backend
    restart: always
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      MONGO_URI_PROD: mongodb://admin:password123@mongodb:27017/kulinarya?authSource=admin
      JWT_SECRET: your_jwt_secret_key_here
      CLIENT_URL_PROD: https://your-frontend-domain.com
      EMAIL_HOST: smtp.resend.com
      EMAIL_PORT: 465
      EMAIL_USER: your_resend_api_key
      EMAIL_PASSWORD: your_resend_api_key
      EMAIL_FROM: noreply@kulinarya.com
      SUPABASE_URL: your_supabase_project_url
      SUPABASE_ANON_KEY: your_supabase_anon_key
      SUPABASE_BUCKET_NAME: your_bucket_name
      INITIAL_ADMIN_EMAIL: admin@kulinarya.com
      INITIAL_ADMIN_PASSWORD: admin_password_here
    depends_on:
      - mongodb
    volumes:
      - ./logs:/app/logs

volumes:
  mongodb_data:
```

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 4000

# Start application
CMD ["node", "server.js"]
```

### Build and Run
```bash
# Build the Docker image
docker-compose build

# Start the services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security groups: Open ports 22, 80, 443, 4000

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

4. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url> /opt/kulinarya
   cd /opt/kulinarya/server
   
   # Install dependencies
   npm install
   
   # Configure environment
   cp .env.example .env
   nano .env  # Edit with your production values
   
   # Start with PM2
   pm2 start server.js --name kulinarya-backend
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx as Reverse Proxy**
   ```bash
   # Install Nginx
   sudo apt install -y nginx
   
   # Create Nginx configuration
   sudo nano /etc/nginx/sites-available/kulinarya
   ```

   Nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/kulinarya /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Cluster**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free tier cluster
   - Configure network access (allow your IP)
   - Create database user

2. **Get Connection String**
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/kulinarya
   ```

3. **Update Environment Variable**
   ```env
   MONGO_URI_PROD=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kulinarya
   ```

### Supabase Storage Setup

1. **Create Supabase Project**
   - Sign up at https://supabase.com
   - Create new project
   - Note project URL and anon key

2. **Create Storage Buckets**
   ```sql
   -- Run in SQL Editor
   INSERT INTO storage.buckets (id, name, public) VALUES
   ('profile_pictures', 'profile_pictures', true),
   ('recipe_pictures', 'recipe_pictures', true),
   ('recipe_videos', 'recipe_videos', true);
   ```

3. **Configure Policies**
   ```sql
   -- Allow public read access
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (true);
   
   -- Allow authenticated uploads
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   -- Allow users to update their own files
   CREATE POLICY "Users can update own files" ON storage.objects
   FOR UPDATE USING (auth.uid() = owner);
   
   -- Allow users to delete their own files
   CREATE POLICY "Users can delete own files" ON storage.objects
   FOR DELETE USING (auth.uid() = owner);
   ```

4. **Update Environment Variables**
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_BUCKET_NAME=your-bucket-name
   ```

### Email Service Setup (Resend)

1. **Create Resend Account**
   - Sign up at https://resend.com
   - Verify your domain
   - Get API key

2. **Update Environment Variables**
   ```env
   EMAIL_HOST=smtp.resend.com
   EMAIL_PORT=465
   EMAIL_USER=your_resend_api_key
   EMAIL_PASSWORD=your_resend_api_key
   EMAIL_FROM=noreply@your-domain.com
   ```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Install Certbot**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

### Firewall Configuration
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Environment Security
```bash
# Generate secure JWT secret
openssl rand -base64 32

# Set secure file permissions
chmod 600 .env
chown nodejs:nodejs .env
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs kulinarya-backend

# Application status
pm2 status

# Restart application
pm2 restart kulinarya-backend

# Update application
pm2 reload kulinarya-backend
```

### Log Rotation
Create log rotation configuration:
```bash
sudo nano /etc/logrotate.d/kulinarya
```

```bash
/opt/kulinarya/server/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 nodejs nodejs
    postrotate
        pm2 reload kulinarya-backend --update-env
    endscript
}
```

### Health Check Endpoint
The application includes a health check at the root endpoint:
```
GET /
```
Response: `Backend is running`

## 🔄 Database Migrations

### Initial Setup
```bash
# The application automatically creates initial admin user
# Check logs for "Initial Login Success!" message
```

### Backup Database
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/kulinarya" --out=/backup/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb://localhost:27017/kulinarya" /backup/20240101
```

### Database Indexes
The application automatically creates necessary indexes. To manually verify:
```javascript
// Connect to MongoDB shell
mongo

// Check indexes
use kulinarya
db.users.getIndexes()
db.recipes.getIndexes()
db.moderations.getIndexes()
```

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs kulinarya-backend
   
   # Check environment variables
   echo $NODE_ENV
   
   # Check port availability
   netstat -tulpn | grep :4000
   ```

2. **Database connection issues**
   ```bash
   # Test MongoDB connection
   mongosh "mongodb://localhost:27017/kulinarya"
   
   # Check MongoDB service
   sudo systemctl status mongod
   
   # Check MongoDB logs
   sudo journalctl -u mongod -f
   ```

3. **File upload failures**
   ```bash
   # Check Supabase configuration
   curl -X POST https://your-project-id.supabase.co/storage/v1/object/list/profile_pictures \
     -H "Authorization: Bearer your-anon-key"
   
   # Check file permissions
   ls -la /opt/kulinarya/server/logs/
   ```

4. **Email delivery issues**
   ```bash
   # Test email configuration
   node -e "require('./src/utils/emailTransporter.js').verify()"
   
   # Check email logs
   grep -i "email" /opt/kulinarya/server/logs/error.log
   ```

### Performance Optimization

1. **Database Indexing**
   ```javascript
   // Ensure indexes are created
   db.recipes.createIndex({ status: 1, isFeatured: 1 })
   db.recipes.createIndex({ byUser: 1, deletedAt: 1 })
   db.reactions.createIndex({ fromPost: 1, byUser: 1 })
   ```

2. **Connection Pooling**
   ```javascript
   // In database.js
   mongoose.connect(MONGO_URI, {
     maxPoolSize: 10,
     minPoolSize: 5,
     socketTimeoutMS: 45000,
   });
   ```

3. **Caching Strategy**
   Consider implementing Redis for:
   - Frequently accessed recipe lists
   - User session data
   - Platform statistics

## 📈 Scaling

### Horizontal Scaling
1. **Load Balancer Configuration**
   ```nginx
   upstream kulinarya_backend {
       server backend1.your-domain.com:4000;
       server backend2.your-domain.com:4000;
       server backend3.your-domain.com:4000;
   }
   ```

2. **Session Management**
   Use Redis for session storage:
   ```javascript
   const session = require('express-session');
   const RedisStore = require('connect-redis')(session);
   
   app.use(session({
       store: new RedisStore({ client: redisClient }),
       secret: process.env.SESSION_SECRET,
       resave: false,
       saveUninitialized: false,
   }));
   ```

### Database Scaling
1. **Read Replicas**
   ```env
   MONGO_URI_PROD=mongodb://primary,replica1,replica2/kulinarya?replicaSet=rs0
   ```

2. **Sharding Strategy**
   Consider sharding by:
   - User geography
   - Recipe categories
   - Time-based partitioning

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to EC2
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ${{ secrets.EC2_USER }}
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /opt/kulinarya/server
          git pull origin main
          npm install --production
          pm2 reload kulinarya-backend
```

### Environment Variables in CI/CD
```yaml
- name: Set up environment
  run: |
    echo "JWT_SECRET=${{ secrets.JWT_SECRET }}" >> .env
    echo "MONGO_URI_PROD=${{ secrets.MONGO_URI_PROD }}" >> .env
    # ... other variables
```

## 📝 Maintenance

### Regular Tasks
1. **Database backups**
   ```bash
   # Daily backup script
   0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/kulinarya" --out=/backup/$(date +\%Y\%m\%d)
   ```

2. **Log rotation**
   ```bash
   # Weekly log cleanup
   0 3 * * 0 find /opt/kulinarya/server/logs -name "*.log" -mtime +30 -delete
   ```

3. **Security updates**
   ```bash
   # Weekly system updates
   0 4 * * 1 sudo apt update && sudo apt upgrade -y
   ```

### Monitoring Checklist
- [ ] Application uptime
- [ ] Database connection pool
- [ ] File storage availability
- [ ] Email delivery rates
- [ ] API response times
- [ ] Error rate monitoring
- [ ] Disk space usage
- [ ] Memory usage

## 🆘 Support

### Getting Help
1. **Check logs**: `pm2 logs kulinarya-backend`
2. **Verify services**: MongoDB, Nginx, Node.js
3. **Test endpoints**: Use Bruno collection
4. **Check environment**: Verify all variables are set

### Common Error Messages
| Error | Solution |
|-------|----------|
| `MongoDB Connection Error` | Check connection string and network |
| `JWT Secret Missing` | Set JWT_SECRET in environment |
| `Supabase Upload Failed` | Verify bucket permissions |
| `Email Send Failed` | Check SMTP credentials |

### Contact Points
- **Database Issues**: MongoDB logs at `/var/log/mongodb/`
- **Application Issues**: PM2 logs via `pm2 logs`
- **Web Server Issues**: Nginx logs at `/var/log/nginx/`

---

*This deployment guide provides comprehensive instructions for setting up and maintaining the Kulinarya backend in various environments. Always test changes in a staging environment before deploying to production.*