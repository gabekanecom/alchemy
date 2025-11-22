# Supabase Setup Guide

Alchemy uses Supabase for authentication and file storage. This guide will help you set up Supabase for both local development and production.

## Quick Start

### Option 1: Use Supabase Cloud (Recommended for getting started)

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new organization (if you don't have one)
   - Create a new project

2. **Get your API keys**
   - Go to Project Settings → API
   - Copy the following:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

3. **Update your `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Enable Authentication Providers**
   - Go to Authentication → Providers
   - Enable Email (enabled by default)
   - Optional: Enable Google, GitHub, etc.

### Option 2: Local Supabase (Advanced)

1. **Install Supabase CLI**
   ```bash
   brew install supabase/tap/supabase
   # or
   npm install -g supabase
   ```

2. **Initialize Supabase**
   ```bash
   supabase init
   ```

3. **Start Supabase locally**
   ```bash
   supabase start
   ```

4. **Get your local credentials**
   After starting, you'll see output like:
   ```
   API URL: http://localhost:54321
   anon key: your-local-anon-key
   service_role key: your-local-service-role-key
   ```

5. **Update your `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
   ```

## Authentication Setup

Alchemy uses Supabase Auth for user management. The authentication is already integrated, but you can customize it:

### Available Auth Methods

1. **Email/Password** (Default)
   - Users can sign up with email and password
   - Email confirmation is optional

2. **Magic Links**
   - Passwordless authentication via email
   - Can be enabled in Supabase dashboard

3. **OAuth Providers**
   - Google (recommended)
   - GitHub
   - And many more

### Configuring Google OAuth (Optional but recommended)

1. **Create Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback` (for cloud)
     - `http://localhost:54321/auth/v1/callback` (for local)

2. **Add to Supabase**
   - Go to Authentication → Providers → Google
   - Enable Google provider
   - Add your Client ID and Client Secret
   - Save

## User Management

### How it Works

1. Users authenticate through Supabase Auth
2. On first login, their profile is automatically synced to our Prisma database
3. The user ID from Supabase is used across the application
4. User data is stored in our local Postgres database for relationships with brands, content, etc.

### User Flow

```
Sign Up → Supabase Auth creates user → Our app syncs to Prisma → User can create brands/content
```

## Storage Setup (Optional - for media uploads)

1. **Go to Storage in Supabase Dashboard**
2. **Create buckets:**
   - `brand-logos` - For brand logo uploads
   - `media-library` - For content media (images, videos)
   - `generated-images` - For AI-generated images

3. **Set bucket policies:**
   - Make buckets public for read access
   - Restrict write access to authenticated users

Example policy:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media-library');

-- Allow public read access
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-library');
```

## Database Sync

**Important:** Supabase Auth and our Prisma database are separate:
- Supabase manages authentication (login, sessions, OAuth)
- Prisma manages application data (brands, content, ideas, etc.)
- User IDs are synced between both systems

The local Postgres database (via Docker) is the source of truth for:
- Brands
- Ideas
- Content
- Publications
- Analytics

## Security Best Practices

1. **Never commit secrets**
   - `.env.local` is in `.gitignore`
   - Use environment variables for all keys

2. **Use Row Level Security (RLS)**
   - If you move to Supabase for the database too
   - Enable RLS on all tables
   - Create policies for user data access

3. **Service Role Key**
   - Only use on the server side
   - Never expose to the client
   - Keep it secret!

## Troubleshooting

### "Invalid API key" error
- Check that your environment variables are set correctly
- Restart your development server after changing `.env.local`

### "User already exists" error
- This happens if email is already registered
- Use the forgot password flow to reset

### Local Supabase not starting
- Make sure Docker is running
- Check that ports 54321-54323 are available
- Run `supabase stop` and `supabase start` again

## Production Deployment

When deploying to production:

1. **Create a production Supabase project** (separate from dev)
2. **Set environment variables** in your hosting platform (Vercel, etc.)
3. **Configure OAuth redirect URLs** for your production domain
4. **Enable email confirmations** (recommended for production)
5. **Set up custom SMTP** (optional - for branded emails)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
