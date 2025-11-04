// Firebase Configuration
// IMPORTANT: Replace these values with your Firebase project credentials
// You'll get these from Firebase Console after creating a project

export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Enable Firestore Database
// 4. Go to Project Settings > General
// 5. Scroll down to "Your apps" and click Web icon (</>)
// 6. Register app and copy the config values
// 7. Replace the values above with your actual config
// 8. Set up Firestore security rules (see FIREBASE_SETUP.md)
