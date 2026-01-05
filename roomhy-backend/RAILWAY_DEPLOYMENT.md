# Roomhy Backend - Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository linked to Railway
- MongoDB Atlas account

## Step 1: Connect GitHub Repository to Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account and select the `roomhylink/project` repository
5. Select the main branch

## Step 2: Configure Environment Variables on Railway

In your Railway project settings, add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://roomhydb:roomhydbkota41@cluster0.cj1yqn9.mongodb.net/?appName=Cluster0
JWT_SECRET=roomhy_secret_key_123
```

## Step 3: Configure Build and Start Commands

Railway should automatically detect:
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

If not set automatically, configure them in the Railway project settings.

## Step 4: Deploy

Railway will automatically deploy when you:
1. Push changes to the main branch
2. Or manually trigger a deployment from the Railway dashboard

## Step 5: Update Frontend API Endpoints

Update all frontend files to use the Railway backend URL instead of localhost:

Replace:
```javascript
http://localhost:5000
```

With:
```javascript
https://your-railway-app-url.up.railway.app
```

Find and replace in these files:
- `website/index.html`
- `website/ourproperty.html`
- `website/list.html`
- `website/property.html`
- `website/chathome.html`
- `Areamanager/visit.html`
- And other files with API calls

## Testing the Deployment

1. Check Railway deployment logs:
   - Go to Railway Dashboard
   - Click on your service
   - Check the "Deploy" and "Logs" sections

2. Test the API endpoints:
   ```bash
   curl https://your-railway-app-url.up.railway.app/api/website-enquiry/all
   ```

3. Test Socket.IO connection:
   - Open any chat page in the website
   - Check browser console for connection status

## Troubleshooting

### Deployment Fails
- Check the Railway deployment logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### MongoDB Connection Issues
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (should allow all IPs for Railway)
- Confirm database user credentials

### CORS Issues
- The backend has CORS enabled for all origins
- If issues persist, update CORS configuration in `server.js`

### Socket.IO Not Working
- Ensure WebSocket support is enabled (Railway supports it)
- Update frontend to use the Railway URL for Socket.IO connections
- Check browser console for connection errors

## Continuous Deployment

Once connected to Railway:
- Every push to `main` branch automatically triggers a deployment
- Deployments take 2-5 minutes
- Check Railway dashboard for deployment status and logs

## Getting Your Railway App URL

After successful deployment:
1. Go to Railway Dashboard
2. Click on your service
3. Look for "Domain" or "URL" in the settings
4. Use this URL to replace `localhost:5000` in frontend code

Example: `https://roomhy-backend-prod-xyz.up.railway.app`
