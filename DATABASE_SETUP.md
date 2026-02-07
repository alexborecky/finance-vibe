# Database Setup Instructions

## Step 1: Apply the Enhanced Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/schema_enhanced.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

The schema will:
- Create or update the profiles, goals, transactions, and invitations tables
- Set up Row Level Security (RLS) policies
- Configure your email (**boreckyalex@gmail.com**) as the superadmin
- Add performance indexes

## Step 2: Verify Setup

After running the schema, verify in the **Table Editor**:
- ✅ `profiles` table exists
- ✅ `goals` table exists
- ✅ `transactions` table exists
- ✅ `invitations` table exists

## Step 3: Enable Email Auth (if not already enabled)

1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure email templates if desired (optional)

## Step 4: Start the Development Server

```bash
npm run dev
```

## Step 5: Create Your Account

1. Visit `http://localhost:3000/auth/login`
2. Since you don't have an account yet, you'll need to sign up
3. For the first signup (superadmin), you may need to temporarily modify the signup page to allow direct signup, OR use the Supabase dashboard to create your user:
   - Go to **Authentication** → **Users**
   - Click **Add User**
   - Enter email: boreckyalex@gmail.com
   - Set a password
   - Your profile will be automatically created with superadmin role

## Troubleshooting

### If you see authentication errors:
- Double check `.env.local` has the correct credentials
- Restart the dev server after adding environment variables

### If RLS policies block access:
- Make sure you're logged in with the correct email
- Check the browser console for specific error messages

### If data doesn't persist:
- Check Network tab to confirm API calls are being made
- Verify RLS policies in Supabase dashboard
