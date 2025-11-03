# 12 Drake Drive - Property Viewing Scheduler

A simple, clean web application for scheduling property viewings. Visitors can select and reserve available time slots, and administrators can manage the available dates and times.

## Features

- ✅ **View Available Time Slots** - See all available viewing dates and times
- ✅ **Reserve Appointments** - Book a viewing time with contact information
- ✅ **Admin Panel** - Separate admin page with advanced time slot management
- ✅ **Auto-Generate Slots** - Set slot length (10/20/30/45/60 min) and time range, slots auto-generate
- ✅ **Shareable Booking Link** - Copy link to share on Facebook, text, or email
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Local Storage** - All data stored in browser (no backend required)

## Pages

- **`index.html`** - Public booking page (share this link!)
- **`admin.html`** - Admin panel (manage time slots and view bookings)

## 🚀 Deploy to GitHub Pages

### Quick Start:
1. **Create GitHub repository** (name it `property-viewing-scheduler`)
2. **Push code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/property-viewing-scheduler.git
   git branch -M main
   git push -u origin main
   ```
3. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: `main` branch, `/ (root)` folder
   - Save

### Your Live Links:
- **Booking Page:** `https://YOUR_USERNAME.github.io/property-viewing-scheduler/index.html`
- **Admin Panel:** `https://YOUR_USERNAME.github.io/property-viewing-scheduler/admin.html`

**See `DEPLOYMENT.md` for detailed step-by-step instructions!**

## Usage

### For Visitors

1. Open the booking page (`index.html`)
2. Browse available dates and times
3. Click on an available time slot
4. Fill out the booking form with your information
5. Confirm your booking

### For Administrators

1. Open the admin page (`admin.html`)
2. **Create Time Slots:**
   - Select a date
   - Choose slot length (10, 20, 30, 45, or 60 minutes)
   - Set start time
   - Set end time
   - Click "Generate Time Slots" to preview
   - Confirm to add all slots
3. **Share Booking Link:**
   - Copy the booking link from the admin panel
   - Share on Facebook, text messages, or email
4. **View Bookings:**
   - See all bookings with contact information
5. **Manage Slots:**
   - Delete time slots if needed (this will also remove all bookings for that slot)

## Data Storage

Currently uses browser localStorage for data persistence. This means:
- Data is stored locally in each browser
- Data persists across sessions
- For production use, consider implementing a backend API

## File Structure

```
property-viewing-scheduler/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Customization

### Change Property Address
Edit the header in `index.html`:
```html
<h1>12 Drake Drive</h1>
```

### Change Colors
Edit the CSS variables or gradient in `styles.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## Future Enhancements

- Email notifications for bookings
- Backend API for data persistence across devices
- Calendar view option
- Export bookings to CSV
- Email confirmations
- Admin login/password protection

## License

Free to use and modify.

---

**Note:** This app uses localStorage, so data is stored locally in each browser. For multi-user scenarios, consider implementing a backend solution.

