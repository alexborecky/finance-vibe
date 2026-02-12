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
- Configure the testing email (**tester.bencheer@gmail.com**) as an admin
- Add performance indexes

## Step 2: Environment Configuration

The application needs to connect to your Supabase project. You do this using environment variables.

1. Find the file named `.env.local.example` in the root of the project.
2. **Copy** it and **rename** the copy to `.env.local`.
   - On Mac/Linux: `cp .env.local.example .env.local`
   - On Windows: `copy .env.local.example .env.local`
3. Open `.env.local` in your editor.
4. Go to your **Supabase Dashboard** -> **Project Settings** -> **API**.
5. Copy **Project URL** and paste it into `NEXT_PUBLIC_SUPABASE_URL`.
6. Copy **anon (public)** key and paste it into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

> [!NOTE]
> `.env.local` is ignored by Git, so your secret keys won't be shared on GitHub.

## Step 3: Verify Setup

After running the schema, verify in the **Table Editor**:
- ✅ `profiles` table exists
- ✅ `goals` table exists
- ✅ `transactions` table exists
- ✅ `invitations` table exists

## Step 4: Enable Email Auth (if not already enabled)

1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure email templates if desired (optional)

## Step 5: Start the Development Server

```bash
npm install
npm run dev
```

## Step 6: Create Your Account

1. Visit `http://localhost:3000/auth/login`
2. Since you don't have an account yet, you'll need to sign up
3. For the first signup (superadmin), use your email: **boreckyalex@gmail.com**
4. For beta testing (admin access), use the email: **tester.bencheer@gmail.com**
5. Your profile will be automatically created with the assigned role.

## Troubleshooting

### If you see authentication errors:
- Double check `.env.local` has the correct credentials (no spaces, no quotes unless needed).
- Restart the dev server (`Ctrl+C` then `npm run dev`) after adding environment variables.

### If RLS policies block access:
- Make sure you're logged in with the correct email (**boreckyalex@gmail.com** or **tester.bencheer@gmail.com**).
- Check the browser console for specific error messages.

### If data doesn't persist:
- Check Network tab to confirm API calls are being made
- Verify RLS policies in Supabase dashboard
