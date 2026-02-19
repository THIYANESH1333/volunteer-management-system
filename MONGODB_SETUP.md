# MongoDB Setup Instructions

## The Error
You're seeing 500 Internal Server Errors because MongoDB is not running. The server cannot connect to the database.

## Solution: Start MongoDB

### Option 1: Start MongoDB Service (Recommended)
1. Open PowerShell or Command Prompt **as Administrator**
2. Run the following command:
   ```powershell
   net start MongoDB
   ```

### Option 2: Start MongoDB Manually
If the service doesn't work, you can start MongoDB manually:
1. Find your MongoDB installation directory (usually `C:\Program Files\MongoDB\Server\<version>\bin`)
2. Open Command Prompt as Administrator
3. Navigate to the bin directory and run:
   ```cmd
   mongod --dbpath "C:\data\db"
   ```
   (Make sure the `C:\data\db` directory exists, or use a different path)

### Option 3: Use MongoDB Atlas (Cloud - No Local Installation Needed)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `server/.env` file:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   ```

## Verify MongoDB is Running
After starting MongoDB, you should see in the server console:
```
✅ MongoDB connected
```

## Current Status
- Server is running on: `http://localhost:5002`
- Frontend is running on: `http://localhost:3001`
- MongoDB needs to be started manually

## After Starting MongoDB
Once MongoDB is running, the registration and login features will work properly. The server will automatically connect when MongoDB becomes available.

