# 🚀 Deploying InsightForge to Vercel

This project is structured to be deployed as a single Vercel project.

## 1. Environment Variables
You must set the following environment variables in your Vercel Project Settings:

### Backend Variables:
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `EMAIL_USER`: Your Gmail address (`sanjaykumaar772@gmail.com`).
- `EMAIL_PASS`: Your Gmail App Password (`ifzr xnvx tsdq jkdq`).
- `NODE_ENV`: `production`

### Frontend Variables:
- `VITE_API_URL`: Your Vercel deployment URL (e.g., `https://insight-forge.vercel.app`).

## 2. Deployment Steps
1. Push your code to GitHub (Done ✅).
2. Go to [Vercel](https://vercel.com/new).
3. Import the `InsightForge` repository.
4. Vercel should automatically detect the `vercel.json` and configure the project.
5. Add the Environment Variables listed above.
6. Click **Deploy**.

## 3. Post-Deployment
- Once deployed, copy your production URL (e.g., `https://insight-forge.vercel.app`).
- Update the `VITE_API_URL` environment variable in Vercel settings with this URL.
- Re-deploy to apply the change.

---
*Note: The backend tracking pixel relies on the `VITE_API_URL` being correctly set to your production domain.*
