# Deployment Fix Guide

## Current Issues
1. **404 Error**: Frontend trying to call backend directly instead of through Next.js API routes
2. **TypeError**: API returning non-array data when array is expected
3. **Environment Variables**: Missing or incorrect environment variables in Vercel

## Solution Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel dashboard and add these environment variables:

```
PYTHON_BACKEND_URL=https://litwise-backend.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://lit-wise.vercel.app
```

### 2. Redeploy Your Application

After setting the environment variables, redeploy your application:

1. Go to your Vercel dashboard
2. Select your project
3. Click "Redeploy" or push a new commit to trigger deployment

### 3. Verify Backend is Working

Your backend is already working correctly. You can test it:

```bash
curl -X POST https://litwise-backend.onrender.com/api/python/genres \
  -H "Content-Type: application/json" \
  -d '{"top_n": 5}'
```

### 4. Test the Fixed Application

After redeployment, your application should work correctly:

1. Frontend calls `/api/genres` (Next.js API route)
2. Next.js API route calls `https://litwise-backend.onrender.com/api/python/genres`
3. Backend returns data to Next.js
4. Next.js returns data to frontend

## Expected Behavior

- ✅ Frontend loads without 404 errors
- ✅ Genres are displayed correctly
- ✅ No more "a.map is not a function" errors
- ✅ All API calls work through Next.js routes

## Troubleshooting

If issues persist:

1. **Check Vercel Logs**: Look at the function logs in Vercel dashboard
2. **Verify Environment Variables**: Ensure they're set correctly
3. **Test Backend Directly**: Confirm backend is responding
4. **Clear Browser Cache**: Hard refresh the page

## Local Development

For local development, create a `.env.local` file:

```env
PYTHON_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Then start both servers:
- Backend: `python main.py` (port 8000)
- Frontend: `npm run dev` (port 3000) 