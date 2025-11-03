// Admin Panel JavaScript
// Data Storage - Using localStorage (same as main app)
const STORAGE_KEY_SLOTS = 'viewingTimeSlots';
const STORAGE_KEY_BOOKINGS = 'viewingBookings';

// Initialize
let timeSlots = [];
let bookings = [];
let previewSlots = [];

// Load data from localStorage
function loadData() {
    const savedSlots = localStorage.getItem(STORAGE_KEY_SLOTS);
    const savedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    
    if (savedSlots) {
        timeSlots = JSON.parse(savedSlots);
    }
    
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    }
    
    updateAdminSlotsList();
    updateBookingsList();
    updateBookingLink();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('adminDate').setAttribute('min', today);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(timeSlots));
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date for storage (YYYY-MM-DD)
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display
function formatDisplayDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format time for display (12-hour format)
function formatTimeForDisplay(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Calculate time after adding minutes
function addMinutes(time24, minutesToAdd) {
    const [hours, mins] = time24.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

// Compare times (returns true if time1 < time2)
function isTimeBefore(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return h1 < h2 || (h1 === h2 && m1 < m2);
}

// Generate time slots based on configuration
function generateTimeSlots() {
    const dateInput = document.getElementById('adminDate');
    const slotLength = parseInt(document.getElementById('slotLength').value);
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    // Validation
    if (!dateInput.value || !slotLength || !startTime || !endTime) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!isTimeBefore(startTime, endTime)) {
        alert('Start time must be before end time');
        return;
    }
    
    // Generate slots
    const selectedDate = new Date(dateInput.value);
    const dateStr = formatDate(selectedDate);
    previewSlots = [];
    
    let currentTime = startTime;
    let slotNumber = 1;
    
    while (isTimeBefore(currentTime, endTime) || currentTime === endTime) {
        const slotEndTime = addMinutes(currentTime, slotLength);
        
        // Don't create slot if it goes past end time
        if (isTimeBefore(endTime, slotEndTime) && slotEndTime !== endTime) {
            break;
        }
        
        previewSlots.push({
            id: `preview-${slotNumber}`,
            date: dateStr,
            time: currentTime,
            displayDate: formatDisplayDate(selectedDate),
            slotLength: slotLength
        });
        
        currentTime = slotEndTime;
        slotNumber++;
    }
    
    if (previewSlots.length === 0) {
        alert('No time slots can be generated with these settings. Please adjust the times or slot length.');
        return;
    }
    
    // Show preview
    showPreview();
}

// Show preview of generated slots
function showPreview() {
    const previewSection = document.getElementById('previewSection');
    const previewContainer = document.getElementById('previewSlots');
    
    previewContainer.innerHTML = `
        <div class="preview-info">
            <p><strong>Date:</strong> ${previewSlots[0].displayDate}</p>
            <p><strong>Slot Length:</strong> ${previewSlots[0].slotLength} minutes</p>
            <p><strong>Total Slots:</strong> ${previewSlots.length}</p>
        </div>
        <div class="preview-slots-grid">
            ${previewSlots.map(slot => `
                <div class="preview-slot">
                    ${formatTimeForDisplay(slot.time)}
                </div>
            `).join('')}
        </div>
    `;
    
    previewSection.classList.remove('hidden');
}

// Cancel preview
function cancelPreview() {
    document.getElementById('previewSection').classList.add('hidden');
    previewSlots = [];
}

// Confirm and add generated slots
function confirmGenerateSlots() {
    if (previewSlots.length === 0) return;
    
    const dateStr = previewSlots[0].date;
    
    // Check for existing slots on this date
    const existingSlots = timeSlots.filter(slot => slot.date === dateStr);
    if (existingSlots.length > 0) {
        if (!confirm(`There are already ${existingSlots.length} time slot(s) on this date. Adding these will create duplicates. Continue?`)) {
            return;
        }
    }
    
    // Add preview slots to timeSlots
    previewSlots.forEach(previewSlot => {
        const newSlot = {
            id: generateId(),
            date: previewSlot.date,
            time: previewSlot.time,
            displayDate: previewSlot.displayDate,
            slotLength: previewSlot.slotLength
        };
        timeSlots.push(newSlot);
    });
    
    // Sort timeSlots
    timeSlots.sort((a, b) => {
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
        }
        return a.time.localeCompare(b.time);
    });
    
    saveData();
    updateAdminSlotsList();
    cancelPreview();
    
    alert(`Successfully added ${previewSlots.length} time slot(s)!`);
}

// Delete time slot
function deleteTimeSlot(slotId) {
    const slotBookings = bookings.filter(b => b.slotId === slotId);
    
    if (slotBookings.length > 0) {
        if (!confirm(`Are you sure you want to delete this time slot? This will also remove ${slotBookings.length} booking(s) for this slot.`)) {
            return;
        }
    } else {
        if (!confirm('Are you sure you want to delete this time slot?')) {
            return;
        }
    }
    
    // Remove slot
    timeSlots = timeSlots.filter(slot => slot.id !== slotId);
    
    // Remove all bookings for this slot
    bookings = bookings.filter(booking => booking.slotId !== slotId);
    
    saveData();
    updateAdminSlotsList();
    updateBookingsList();
}

// Update admin slots list
function updateAdminSlotsList() {
    const container = document.getElementById('adminSlotsList');
    
    if (timeSlots.length === 0) {
        container.innerHTML = '<p>No time slots added yet.</p>';
        return;
    }
    
    // Group by date
    const slotsByDate = {};
    timeSlots.forEach(slot => {
        if (!slotsByDate[slot.date]) {
            slotsByDate[slot.date] = [];
        }
        slotsByDate[slot.date].push(slot);
    });
    
    // Generate HTML
    let html = '';
    Object.keys(slotsByDate).sort().forEach(date => {
        const dateSlots = slotsByDate[date];
        const displayDate = dateSlots[0].displayDate;
        
        html += `
            <div class="date-group">
                <h4>${displayDate}</h4>
                ${dateSlots.map(slot => {
                    const slotBookings = bookings.filter(b => b.slotId === slot.id);
                    const bookingCount = slotBookings.length;
                    const slotLength = slot.slotLength || 30;
                    
                    return `
                        <div class="admin-slot-item">
                            <div class="slot-info">
                                <div class="slot-time">${formatTimeForDisplay(slot.time)} (${slotLength} min)</div>
                                <div class="slot-bookings">${bookingCount} booking${bookingCount !== 1 ? 's' : ''}</div>
                            </div>
                            <button onclick="deleteTimeSlot('${slot.id}')" class="btn btn-delete">Delete</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update bookings list
function updateBookingsList() {
    const container = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>No bookings yet.</p>';
        return;
    }
    
    // Sort bookings by date
    bookings.sort((a, b) => {
        const slotA = timeSlots.find(s => s.id === a.slotId);
        const slotB = timeSlots.find(s => s.id === b.slotId);
        if (!slotA || !slotB) return 0;
        if (slotA.date !== slotB.date) {
            return slotA.date.localeCompare(slotB.date);
        }
        return slotA.time.localeCompare(slotB.time);
    });
    
    let html = '<div class="bookings-list">';
    bookings.forEach(booking => {
        const slot = timeSlots.find(s => s.id === booking.slotId);
        if (!slot) return;
        
        const bookingDate = new Date(booking.bookingDate);
        
        html += `
            <div class="booking-item">
                <div class="booking-details">
                    <div class="booking-date-time">
                        <strong>${slot.displayDate}</strong> at <strong>${formatTimeForDisplay(slot.time)}</strong>
                    </div>
                    <div class="booking-contact">
                        <strong>${booking.name}</strong><br>
                        📧 ${booking.email}<br>
                        📞 ${booking.phone}
                    </div>
                    ${booking.notes ? `<div class="booking-notes">Note: ${booking.notes}</div>` : ''}
                    <div class="booking-meta">Booked: ${bookingDate.toLocaleString()}</div>
                </div>
                <div class="booking-actions">
                    <button onclick="deleteBooking('${booking.id}')" class="btn btn-delete">Delete Booking</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Delete individual booking
function deleteBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const slot = timeSlots.find(s => s.id === booking.slotId);
    if (!slot) return;
    
    if (!confirm(`Are you sure you want to delete the booking for ${booking.name} on ${slot.displayDate} at ${formatTimeForDisplay(slot.time)}?`)) {
        return;
    }
    
    // Remove booking
    bookings = bookings.filter(b => b.id !== bookingId);
    
    saveData();
    updateBookingsList();
    updateAdminSlotsList();
    
    alert('Booking deleted successfully. The time slot is now available again.');
}

// Update booking link
function updateBookingLink() {
    // Get current page URL and replace admin.html with index.html
    const currentUrl = window.location.href;
    const bookingUrl = currentUrl.replace('admin.html', 'index.html');
    
    const linkInput = document.getElementById('bookingLink');
    linkInput.value = bookingUrl;
}

// Copy booking link to clipboard
function copyBookingLink() {
    const linkInput = document.getElementById('bookingLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        alert('Booking link copied to clipboard!');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(linkInput.value).then(() => {
            alert('Booking link copied to clipboard!');
        }).catch(() => {
            alert('Could not copy link. Please copy manually.');
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

