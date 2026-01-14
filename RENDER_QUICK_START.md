# Quick Start - Render Deployment

## Prerequisites Checklist

- [x] Maven wrapper created (`mvnw` and `mvnw.cmd`)
- [x] Production properties file created (`application-prod.properties`)
- [x] .gitignore configured
- [ ] Git repository initialized and connected
- [ ] Code pushed to GitHub

## Git Setup (First Time)

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/mowamiyya/leaveMangement.git

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Render deployment"

# Push to GitHub
git push -u origin main
```

## Render Deployment Steps

### 1. Create MySQL Database on Render
- Go to Render Dashboard → New → PostgreSQL (or MySQL if available)
- Note the connection details (host, port, database, username, password)

### 2. Create Web Service
- Go to Render Dashboard → New → Web Service
- Connect GitHub repo: `https://github.com/mowamiyya/leaveMangement.git`

### 3. Configure Settings

**Build Command:**
```
./mvnw clean package -DskipTests
```

**Start Command:**
```
java -jar target/leave-management-system-1.0.0.jar
```

**Environment Variables:**
```
DATABASE_URL=jdbc:mysql://[HOST]:[PORT]/leave_management?useSSL=false&serverTimezone=UTC
DB_USERNAME=[USERNAME]
DB_PASSWORD=[PASSWORD]
JWT_SECRET=your-super-secret-jwt-key-minimum-64-characters-long
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
CORS_ORIGINS=https://your-frontend-url.onrender.com
SPRING_PROFILES_ACTIVE=prod
```

### 4. Deploy!

## Important Notes

1. **Maven Wrapper**: The project now includes `mvnw` (Linux/Mac) and `mvnw.cmd` (Windows)
2. **Production Profile**: Set `SPRING_PROFILES_ACTIVE=prod` to use production configuration
3. **Database URL**: Replace `[HOST]`, `[PORT]`, `[USERNAME]`, `[PASSWORD]` with actual values
4. **JWT Secret**: Generate a strong secret (64+ characters)
5. **CORS**: Update after deploying frontend

## After Deployment

1. Check logs in Render dashboard
2. Test health endpoint: `https://your-backend-url.onrender.com/api/public/health`
3. Update CORS_ORIGINS with your frontend URL
4. Redeploy if needed

## Troubleshooting

- **Build fails**: Check Maven logs
- **Can't connect to database**: Verify credentials and use Internal Database URL
- **CORS errors**: Update CORS_ORIGINS environment variable
- **JWT errors**: Ensure JWT_SECRET is set

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
