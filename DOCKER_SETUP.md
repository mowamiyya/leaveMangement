# Docker Setup Guide

## Problem: Database Connection from Docker Container

When running the application in Docker, `localhost` refers to the container itself, not your host machine. To connect to a database running on your host machine, you need to use a special hostname.

## Solution

### For Windows/Mac Docker Desktop:

Use `host.docker.internal` instead of `localhost` in your database URL.

### Update your `.env` file:

```env
DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/leave_management?useSSL=false&serverTimezone=UTC
```

**Important:** Replace `localhost` with `host.docker.internal` in your `DATABASE_URL`.

## Complete `.env` Example for Docker:

```env
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/leave_management?useSSL=false&serverTimezone=UTC
DB_USERNAME=your_username
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-minimum-64-characters-long
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
CORS_ORIGINS=http://localhost:3000
PORT=8080
```

## Alternative Solutions

### Option 1: Use Docker Network (if database is in another container)
If your PostgreSQL is also running in Docker, use Docker networking:
```bash
docker network create leave-management-network
docker run --network leave-management-network --name postgres ...
docker run --network leave-management-network --env-file .env ...
```
Then use the container name instead of `host.docker.internal`.

### Option 2: Use Host Network Mode (Linux only)
```bash
docker run --network host --env-file .env ...
```
This makes the container use the host's network directly.

### Option 3: Use Host IP Address
Find your host machine's IP and use it:
```bash
# Windows PowerShell
ipconfig | Select-String "IPv4"
```
Then use that IP in `DATABASE_URL`.

## Quick Fix Command

To quickly update your `.env` file:

**Windows PowerShell:**
```powershell
(Get-Content .env) -replace 'localhost:5432', 'host.docker.internal:5432' | Set-Content .env
```

## Verify

After updating, rebuild and run:
```bash
docker build -t leave-management-system .
docker run --env-file .env -p 8080:8080 leave-management-system
```
