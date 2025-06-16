# Supabase Setup Instructions

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: Your project name (e.g., "Social Media Automation")
   - Database Password: Create a strong password
   - Region: Choose closest to your location
6. Click "Create new project"

## Step 2: Get Database Connection String
1. Once your project is created, go to Project Settings
2. Navigate to "Database" in the left sidebar
3. Scroll down to "Connection string" section
4. Copy the "URI" connection string under "Connection pooling"
5. Replace `[YOUR-PASSWORD]` with the database password you set in Step 1

## Step 3: Update Environment Variable
The connection string should look like:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Step 4: Set DATABASE_URL
1. In Replit, go to the "Secrets" tab (lock icon in sidebar)
2. Add or update the `DATABASE_URL` secret with your Supabase connection string
3. The app will automatically restart and connect to Supabase

## Features Available
Once connected to Supabase, you'll have:
- Real-time database updates
- Built-in authentication (if needed later)
- Automatic backups
- SQL editor in Supabase dashboard
- Database monitoring and analytics

## Verify Connection
After updating DATABASE_URL, the app will:
1. Automatically connect to Supabase
2. Create all necessary tables via Drizzle migrations
3. Start working with your Supabase database

You can verify the connection by checking that data persists between app restarts and viewing tables in your Supabase dashboard under "Table Editor".