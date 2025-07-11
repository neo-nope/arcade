# Deployment Guide - Render

## Prerequisites
- Render account
- GitHub repository connected to Render
- Firebase project with Firestore enabled
- Service account with proper permissions

## Step 1: Prepare Your Repository
Ensure your repository has:
- `package.json` with all dependencies
- `server.js` configured to use environment variables
- `.env` file for local development (NOT committed to git)
- `.gitignore` includes `.env`

## Step 2: Set Up Environment Variables on Render

1. Go to your Render dashboard
2. Select your service (or create a new Web Service)
3. Navigate to "Environment" tab
4. Add these environment variables:

```
FIREBASE_PROJECT_ID = browsecade
FIREBASE_PRIVATE_KEY_ID = 0dafa12fcc7fc8931a18303dc43cfa9dcb31d476
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----
[YOUR_FULL_PRIVATE_KEY_HERE]
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@browsecade.iam.gserviceaccount.com
FIREBASE_CLIENT_ID = 101901922219251965816
FIREBASE_CLIENT_X509_CERT_URL = https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40browsecade.iam.gserviceaccount.com
SESSION_SECRET = [GENERATE_NEW_SECURE_SECRET_FOR_PRODUCTION]
PORT = 3000
NODE_ENV = production
```

## Step 3: Configure Build Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start` or `node server.js`
- **Node Version**: Latest LTS (or specify in package.json)

## Step 4: Deploy
1. Connect your GitHub repository
2. Select the branch to deploy (usually `main` or `master`)
3. Click "Deploy"

## Step 5: Verify Deployment
1. Check the deployment logs for any errors
2. Visit your deployed URL
3. Test the health endpoint: `https://your-app.onrender.com/health`
4. Verify Firebase connection is working

## Troubleshooting

### Common Issues:
1. **Private Key Format**: Ensure the private key includes quotes and proper line breaks
2. **Firestore Permissions**: Verify your service account has Firestore access
3. **Environment Variables**: Double-check all variables are set correctly
4. **Build Errors**: Check package.json dependencies

### Health Check Endpoint
Your app includes a `/health` endpoint that shows:
- Server status
- Database connection (Firebase/Firestore vs Fallback)
- Environment information

### Logs
Check Render logs for:
- Firebase connection errors
- Authentication issues
- Server startup problems

## Security Notes
- Never commit `.env` files to version control
- Use strong, unique `SESSION_SECRET` for production
- Regularly rotate Firebase service account keys
- Monitor access logs for unusual activity

## Local Development
For local development, use your `.env` file:
```bash
npm install
npm start
```

The server will automatically use environment variables from `.env` in development mode.
