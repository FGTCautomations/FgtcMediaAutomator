# Supabase Auth Migration Setup

## Required Environment Variables

You need to add these environment variables to your Replit project:

### Client-side (add to Replit Secrets):
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server-side (already configured):
```
DATABASE_URL=your_supabase_database_url
```

## How to get these values:

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the following:
   - **Project URL** → use as `VITE_SUPABASE_URL`
   - **Anon public key** → use as `VITE_SUPABASE_ANON_KEY`

## Features after migration:

- Built-in user registration with email verification
- Secure JWT-based authentication
- Social login (Google, GitHub, etc.) support
- Automatic password reset via email
- Session management handled by Supabase
- Real-time user status updates

## Migration process:

1. Add environment variables above
2. Authentication will be migrated to use Supabase Auth
3. Existing user sessions will be preserved
4. New registrations will use Supabase Auth system

Please add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Replit Secrets, then I'll complete the migration.