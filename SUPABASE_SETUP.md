# Supabase Setup Guide

This guide will help you set up Supabase so that your rental viewing scheduler works correctly for all visitors (not just on your browser).

## Why Supabase?

The app was using localStorage, which stores data only in each individual browser. This meant:
- When you created slots on your browser, only you could see them
- When visitors opened the site, they saw an empty schedule
- No data was shared between users

Supabase solves this by storing data in a PostgreSQL database in the cloud, so everyone sees the same schedule.

---

## Step 1: Get Your Supabase Credentials

1. Log in to your Supabase account at [supabase.com](https://supabase.com)
2. Select your project (or create a new one if needed)
3. Click on the **Settings** icon (⚙️) in the left sidebar
4. Click on **API** in the settings menu
5. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

---

## Step 2: Update Your Config File

1. Open `supabase-config.js` in your project
2. Replace the placeholder values:

```javascript
export const supabaseConfig = {
    url: "https://your-project-id.supabase.co",
    anonKey: "your-anon-key-here"
};
```

3. Save the file

---

## Step 3: Create Database Tables

You need to create two tables in Supabase:

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy and paste this SQL code:

```sql
-- Create timeSlots table
CREATE TABLE IF NOT EXISTS timeSlots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    displayDate TEXT,
    slotLength INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slotId UUID REFERENCES timeSlots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    bookingDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timeSlots_date ON timeSlots(date);
CREATE INDEX IF NOT EXISTS idx_timeSlots_time ON timeSlots(time);
CREATE INDEX IF NOT EXISTS idx_bookings_slotId ON bookings(slotId);
CREATE INDEX IF NOT EXISTS idx_bookings_bookingDate ON bookings(bookingDate);
```

4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
5. You should see "Success. No rows returned"

---

## Step 4: Set Up Row Level Security (RLS) Policies

1. In Supabase dashboard, go to **Authentication** > **Policies** (or **Table Editor** > select a table > **RLS** tab)
2. For the **timeSlots** table:
   - Make sure **Enable RLS** is ON
   - Click **New Policy**
   - Choose **"Allow public read/write access"** (or create custom policies below)

**OR** create policies manually:

**For timeSlots table:**
1. Go to **Table Editor** > **timeSlots** table > **Policies** tab
2. Click **New Policy**
3. Policy name: `Allow public read`
4. Allowed operation: `SELECT`
5. Target roles: `public`
6. Policy definition: Leave empty (allows all)
7. Click **Review** then **Save policy**

8. Click **New Policy** again
9. Policy name: `Allow public insert`
10. Allowed operation: `INSERT`
11. Target roles: `public`
12. Policy definition: Leave empty
13. Click **Review** then **Save policy**

14. Click **New Policy** again
15. Policy name: `Allow public delete`
16. Allowed operation: `DELETE`
17. Target roles: `public`
18. Policy definition: Leave empty
19. Click **Review** then **Save policy**

**Repeat the same steps for the bookings table:**
- Create `Allow public read` policy
- Create `Allow public insert` policy
- Create `Allow public delete` policy

**Alternative: Quick SQL approach**

You can also set up RLS policies using SQL:

```sql
-- Enable RLS on tables
ALTER TABLE timeSlots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read on timeSlots" ON timeSlots
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on bookings" ON bookings
    FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert on timeSlots" ON timeSlots
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Allow public delete access
CREATE POLICY "Allow public delete on timeSlots" ON timeSlots
    FOR DELETE USING (true);

CREATE POLICY "Allow public delete on bookings" ON bookings
    FOR DELETE USING (true);
```

Run this in the SQL Editor.

---

## Step 5: Enable Real-time Subscriptions

1. In Supabase dashboard, go to **Database** > **Replication**
2. Find **timeSlots** table and toggle it **ON**
3. Find **bookings** table and toggle it **ON**

This enables real-time updates so changes appear immediately for all users.

---

## Step 6: Test Your Setup

1. Open `admin.html` in your browser
2. Open the browser console (F12)
3. Create a test time slot
4. Check the console for any errors

If you see errors:
- Check your `supabase-config.js` has correct values
- Verify tables were created (check **Table Editor**)
- Verify RLS policies are set up correctly
- Check that real-time is enabled

---

## Step 7: Deploy to GitHub Pages

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push
   ```

2. Your site will automatically update on GitHub Pages
3. Test the live site - visitors should now see the same schedule you create!

---

## Troubleshooting

### "new row violates row-level security policy"
- **Fix:** Make sure RLS policies are created for both tables
- Go to **Table Editor** > select table > **Policies** tab
- Verify policies allow public access

### "relation does not exist"
- **Fix:** Tables weren't created
- Go to **SQL Editor** and run the CREATE TABLE statements again
- Check **Table Editor** to confirm tables exist

### "subscription failed"
- **Fix:** Real-time not enabled
- Go to **Database** > **Replication**
- Enable replication for both `timeSlots` and `bookings` tables

### Data not showing up
- Open browser console (F12) and check for errors
- Verify your `supabase-config.js` has correct values
- Check that tables exist in **Table Editor**
- Verify RLS policies allow public read access

### "Invalid API key"
- **Fix:** Wrong anon key in config
- Go to **Settings** > **API**
- Copy the **anon public** key (not the service_role key)
- Update `supabase-config.js`

---

## Security Note

The current setup allows anyone to read and write data. For a simple rental scheduler, this is fine. 

**For better security later:**
- Add authentication (login) for admin functions
- Restrict write access to authenticated users
- Keep read access public so visitors can see available slots

---

## Free Tier Limits

Supabase free tier includes:
- 500 MB database space
- 2 GB bandwidth
- Unlimited API requests
- Real-time subscriptions included

This is more than enough for a rental viewing scheduler!

---

## Quick Reference

**Get credentials:** Settings (⚙️) > API  
**Create tables:** SQL Editor > Paste SQL > Run  
**Set up RLS:** Table Editor > Select table > Policies tab  
**Enable real-time:** Database > Replication > Toggle ON

---

**Need help?** Check the Supabase documentation: https://supabase.com/docs

