# Deployment Guide - Render.com

This guide walks you through deploying the Leave Management System to Render.com.

## Prerequisites

1. GitHub account with the repository: `https://github.com/mowamiyya/leaveMangement.git`
2. Render.com account (free tier is sufficient)
3. MySQL database (Render provides free MySQL databases)

## Step 1: Prepare the Repository

### 1.1 Initialize Git (if not already initialized)

```bash
git init
git remote add origin https://github.com/mowamiyya/leaveMangement.git
```

### 1.2 Commit and Push Your Code

```bash
git add .
git commit -m "Initial commit - Ready for deployment"
git push -u origin main
```

## Step 2: Set Up MySQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"** (or **"MySQL"** if available)
3. Create a free database:
   - **Name**: `leave-management-db`
   - **Database**: `leave_management`
   - **User**: (auto-generated)
   - **Password**: (auto-generated - **Save this!**)
   - **Region**: Choose closest to you
4. **Note the connection details** (Internal Database URL)

## Step 3: Deploy Spring Boot Backend

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `https://github.com/mowamiyya/leaveMangement.git`
3. Configure the service:

### Basic Settings
- **Name**: `leave-management-backend`
- **Environment**: `Java`
- **Region**: Same as database
- **Branch**: `main`

### Build & Deploy Settings
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/leave-management-system-1.0.0.jar`
- **Instance Type**: `Free`

### Environment Variables
Add the following environment variables:

```
# Database
DATABASE_URL=jdbc:mysql://[HOST]:[PORT]/leave_management?useSSL=false&serverTimezone=UTC
DB_USERNAME=[YOUR_DB_USERNAME]
DB_PASSWORD=[YOUR_DB_PASSWORD]

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-64-characters-long-for-security
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# CORS (Update with your frontend URL after deployment)
CORS_ORIGINS=https://your-frontend-url.onrender.com

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

**Important Notes:**
- Replace `[HOST]`, `[PORT]`, `[YOUR_DB_USERNAME]`, `[YOUR_DB_PASSWORD]` with your actual database credentials
- Generate a strong `JWT_SECRET` (at least 64 characters)
- The `DATABASE_URL` format should be: `jdbc:mysql://[host]:[port]/[database]?useSSL=false&serverTimezone=UTC`
- For Render's internal database connection, use the **Internal Database URL** provided

4. Click **"Create Web Service"**

## Step 4: Update Application Properties for Production

The application uses environment variables. Make sure your `application.properties` or `application-prod.properties` uses:

```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
cors.allowed-origins=${CORS_ORIGINS}
jwt.secret=${JWT_SECRET}
```

## Step 5: Update CORS After Deployment

1. After the backend is deployed, note your backend URL (e.g., `https://leave-management-backend.onrender.com`)
2. Update the `CORS_ORIGINS` environment variable in Render to include your frontend URL
3. Redeploy the service

## Step 6: Verify Deployment

1. Check the **Logs** tab in Render dashboard
2. Look for: `Started LeaveManagementApplication`
3. Test the health endpoint: `https://your-backend-url.onrender.com/api/public/health`
4. Check database connection in logs

## Step 7: Deploy Frontend (Optional - If using Vercel/Netlify)

If you want to deploy the frontend separately:

1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `frontend/dist` folder to:
   - **Vercel**: Connect GitHub repo, set build command: `cd frontend && npm run build`
   - **Netlify**: Deploy the `frontend/dist` folder
   - **Render Static Site**: Upload the `frontend/dist` folder

### Frontend Environment Variables (if needed)

Update your frontend to use the backend URL:
- Create `.env.production`:
  ```
  VITE_API_URL=https://your-backend-url.onrender.com
  ```

## Troubleshooting

### Database Connection Issues
- Verify database credentials are correct
- Use **Internal Database URL** for Render services (faster, no SSL needed)
- Check if database is in the same region as your service

### Build Failures
- Check logs for Maven errors
- Ensure Java 17 is available (Render auto-detects)
- Verify `mvnw` file has execute permissions

### Application Startup Issues
- Check environment variables are set correctly
- Verify JWT_SECRET is set
- Check database connection string format

### CORS Errors
- Update `CORS_ORIGINS` environment variable
- Include both `http://` and `https://` if needed
- Restart service after updating environment variables

## Render Free Tier Limitations

- **512 MB RAM**
- **0.5 CPU**
- **Cold starts**: Service sleeps after 15 minutes of inactivity (takes ~30-60 seconds to wake up)
- **Monthly hours**: 750 hours free per month

## Next Steps

1. Set up a custom domain (Render supports this)
2. Enable HTTPS (automatically enabled)
3. Set up monitoring and alerts
4. Consider upgrading for production use

## Support

For issues:
- Check Render logs
- Check application logs
- Verify environment variables
- Test database connection
