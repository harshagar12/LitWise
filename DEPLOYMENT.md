# Deployment Configuration

## Environment Variables Setup

To deploy your application to Vercel and Render, you need to configure environment variables.

### 1. Create `.env.local` file

Create a `.env.local` file in your project root with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
PYTHON_BACKEND_URL=http://localhost:8000
```

### 2. Production Environment Variables

For production deployment, update the URLs to your deployed services:

#### For Vercel (Frontend)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-frontend-url.vercel.app
PYTHON_BACKEND_URL=https://your-backend-url.onrender.com
```

#### For Render (Backend)
```env
PYTHON_BACKEND_URL=https://your-backend-url.onrender.com
```

### 3. Vercel Configuration

In your Vercel dashboard, add these environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: Your frontend URL (e.g., `https://your-app.vercel.app`)
- `PYTHON_BACKEND_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)

### 4. Render Configuration

In your Render dashboard for the backend service, add:

- `PYTHON_BACKEND_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)

## API Endpoints Updated

The following files have been updated to use environment variables:

### API Routes
- `app/api/clusters/route.ts`
- `app/api/genres/route.ts`
- `app/api/recommendations/route.ts`

### Components
- `components/GenreSelection.tsx`
- `components/ClusterDiscovery.tsx`
- `components/RecommendationsDashboard.tsx`

### Utility
- `lib/api.ts` - New utility file for API configuration

## How It Works

1. **Client-side requests**: Use `NEXT_PUBLIC_API_BASE_URL` for frontend API calls
2. **Server-side requests**: Use `PYTHON_BACKEND_URL` for backend API calls from Next.js API routes
3. **Fallback**: If environment variables are not set, defaults to localhost URLs

## Testing

To test locally:
1. Start your Python backend on port 8000
2. Start your Next.js frontend on port 3000
3. The app will use localhost URLs by default

To test with production URLs:
1. Set the environment variables to your deployed URLs
2. Restart your development server
3. The app will now use the production URLs 