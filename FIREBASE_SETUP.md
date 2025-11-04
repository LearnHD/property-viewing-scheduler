# Firebase Setup Guide

This guide will help you set up Firebase Firestore so that your rental viewing scheduler works correctly for all visitors (not just on your browser).

## Why Firebase?

The app was using localStorage, which stores data only in each individual browser. This meant:
- When you created slots on your browser, only you could see them
- When visitors opened the site, they saw an empty schedule
- No data was shared between users

Firebase Firestore solves this by storing data in the cloud, so everyone sees the same schedule.

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "property-viewing-scheduler")
4. Click **Continue**
5. (Optional) Disable Google Analytics if you don't need it
6. Click **Create project**
7. Wait for project creation to complete
8. Click **Continue**

---

## Step 2: Enable Firestore Database

1. In your Firebase project, click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for now - we'll set up security rules later)
4. Select a location (choose the closest to your users)
5. Click **Enable**
6. Wait for Firestore to initialize

---

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Click **Project settings**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`)
5. Register your app:
   - Enter a nickname (e.g., "Property Scheduler")
   - **Do NOT** check "Also set up Firebase Hosting"
   - Click **Register app**
6. Copy the `firebaseConfig` object that appears

---

## Step 4: Update Your Config File

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
export const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Save the file

---

## Step 5: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click the **Rules** tab
3. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read time slots and bookings
    match /timeSlots/{document=**} {
      allow read: if true;
      allow write: if true; // Allow writes for now (you can add admin auth later)
    }
    
    match /bookings/{document=**} {
      allow read: if true;
      allow write: if true; // Allow writes for now (you can add admin auth later)
    }
  }
}
```

4. Click **Publish**

**Note:** These rules allow anyone to read and write. For production, you should add authentication. For now, this works for a simple rental scheduler.

---

## Step 6: Create Firestore Indexes

1. Go to **Firestore Database** > **Indexes** tab
2. Click **Create Index** if prompted (or wait for auto-creation)
3. The app will automatically create the needed indexes when you first use it

If you see errors about missing indexes, create them manually:

**For timeSlots collection:**
- Collection ID: `timeSlots`
- Fields: `date` (Ascending), `time` (Ascending)
- Query scope: Collection

**For bookings collection:**
- Collection ID: `bookings`
- Fields: `bookingDate` (Descending)
- Query scope: Collection

---

## Step 7: Test Your Setup

1. Open `admin.html` in your browser
2. Open the browser console (F12)
3. Create a test time slot
4. If you see any Firebase errors in the console, check:
   - Your `firebase-config.js` has correct values
   - Firestore is enabled in your Firebase project
   - Security rules are published

---

## Step 8: Deploy to GitHub Pages

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Firebase Firestore integration"
   git push
   ```

2. Your site will automatically update on GitHub Pages
3. Test the live site - visitors should now see the same schedule you create!

---

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Firebase Console > Project Settings > General
- Scroll to "Authorized domains"
- Add your GitHub Pages domain (e.g., `yourusername.github.io`)

### "Missing or insufficient permissions"
- Check your Firestore security rules
- Make sure they're published (click "Publish" button)

### "Index not found"
- Go to Firestore > Indexes
- Create the missing index as described in Step 6
- Wait a few minutes for index creation to complete

### Data not showing up
- Open browser console (F12) and check for errors
- Verify your `firebase-config.js` has correct values
- Check that Firestore is enabled in Firebase Console

---

## Next Steps (Optional)

For better security, you can add authentication later:
1. Enable Firebase Authentication
2. Add admin login to admin.html
3. Update security rules to require authentication for writes

---

## Free Tier Limits

Firebase free tier includes:
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day

This is more than enough for a rental viewing scheduler!

---

**Need help?** Check the Firebase documentation: https://firebase.google.com/docs/firestore

