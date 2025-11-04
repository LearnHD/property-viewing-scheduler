// Supabase table names (PostgreSQL converts to lowercase)
const TABLE_SLOTS = 'timeslots';
const TABLE_BOOKINGS = 'bookings';

// Initialize
let timeSlots = [];
let bookings = [];
let previewSlots = [];
let slotsSubscription = null;
let bookingsSubscription = null;

// Load data from Supabase
async function loadData() {
    // Wait for Supabase to initialize
    if (!window.supabase) {
        setTimeout(loadData, 100);
        return;
    }
    
    // Set up real-time subscriptions
    setupRealtimeListeners();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('adminDate').setAttribute('min', today);
}

// Set up real-time listeners for Supabase data
function setupRealtimeListeners() {
    const supabase = window.supabase;
    
    // Listen for time slots changes
    slotsSubscription = supabase
        .channel('admin-time-slots-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: TABLE_SLOTS },
            async () => {
                // Reload slots when changes occur
                await loadTimeSlots();
            }
        )
        .subscribe();
    
    // Load initial time slots
    loadTimeSlots();
    
    // Listen for bookings changes
    bookingsSubscription = supabase
        .channel('admin-bookings-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: TABLE_BOOKINGS },
            async () => {
                // Reload bookings when changes occur
                await loadBookings();
            }
        )
        .subscribe();
    
    // Load initial bookings
    loadBookings();
}

// Load time slots from Supabase
async function loadTimeSlots() {
    try {
        const supabase = window.supabase;
        const { data, error } = await supabase
            .from(TABLE_SLOTS)
            .select('*')
            .order('date', { ascending: true })
            .order('time', { ascending: true });
        
        if (error) {
            console.error('Error loading time slots:', error);
            return;
        }
        
        timeSlots = data || [];
        updateAdminSlotsList();
    } catch (error) {
        console.error('Error loading time slots:', error);
    }
}

// Load bookings from Supabase
async function loadBookings() {
    try {
        const supabase = window.supabase;
        const { data, error } = await supabase
            .from(TABLE_BOOKINGS)
            .select('*')
            .order('bookingDate', { ascending: false });
        
        if (error) {
            console.error('Error loading bookings:', error);
            return;
        }
        
        bookings = data || [];
        updateBookingsList();
        updateAdminSlotsList();
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Generate unique ID (for client-side use, Supabase generates its own IDs)
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

// Format date for display from Date object
function formatDisplayDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format date for display from date string (YYYY-MM-DD)
function formatDisplayDateFromString(dateStr) {
    // Parse date string directly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed, create in local timezone
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
    // Parse date string directly to avoid timezone issues
    // dateInput.value is in format YYYY-MM-DD
    const dateStr = dateInput.value; // Use directly as it's already in correct format
    
    // Create Date object in local timezone for display
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // month is 0-indexed
    
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
    
    // Recalculate displayDate from date string to ensure accuracy
    const displayDate = formatDisplayDateFromString(previewSlots[0].date);
    
    previewContainer.innerHTML = `
        <div class="preview-info">
            <p><strong>Date:</strong> ${displayDate}</p>
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
    const previewSection = document.getElementById('previewSection');
    if (previewSection) {
        previewSection.classList.add('hidden');
    }
    previewSlots = [];
    
    // Clear the form inputs
    document.getElementById('adminDate').value = '';
    document.getElementById('slotLength').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
}

// Confirm and add generated slots (async to work with Supabase)
async function confirmGenerateSlots() {
    if (previewSlots.length === 0) return;
    
    const dateStr = previewSlots[0].date;
    
    // Check for existing slots on this date
    const existingSlots = timeSlots.filter(slot => slot.date === dateStr);
    if (existingSlots.length > 0) {
        if (!confirm(`There are already ${existingSlots.length} time slot(s) on this date. Adding these will create duplicates. Continue?`)) {
            return;
        }
    }
    
    try {
        const supabase = window.supabase;
        
        // Prepare slots for insertion (remove preview ID)
        // Use lowercase column names to match PostgreSQL schema
        const slotsToInsert = previewSlots.map(previewSlot => ({
            date: previewSlot.date,
            time: previewSlot.time,
            displaydate: previewSlot.displayDate,
            slotlength: previewSlot.slotLength
        }));
        
        // Insert all slots at once
        const { data, error } = await supabase
            .from(TABLE_SLOTS)
            .insert(slotsToInsert)
            .select();
        
        if (error) {
            console.error('Error adding slots:', error);
            alert('Error adding time slots. Please try again.');
            return;
        }
        
        cancelPreview();
        alert(`Successfully added ${previewSlots.length} time slot(s)!`);
        // Note: updateAdminSlotsList() will be called automatically by the real-time listener
    } catch (error) {
        console.error('Error adding slots:', error);
        alert('Error adding time slots. Please try again.');
    }
}

// Delete time slot (async to work with Supabase)
async function deleteTimeSlot(slotId) {
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
    
    try {
        const supabase = window.supabase;
        
        // Delete all bookings for this slot first
        for (const booking of slotBookings) {
            const { error } = await supabase
                .from(TABLE_BOOKINGS)
                .delete()
                .eq('id', booking.id);
            
            if (error) {
                console.error('Error deleting booking:', error);
            }
        }
        
        // Delete the slot
        const { error } = await supabase
            .from(TABLE_SLOTS)
            .delete()
            .eq('id', slotId);
        
        if (error) {
            console.error('Error deleting slot:', error);
            alert('Error deleting time slot. Please try again.');
            return;
        }
        
        // Note: updateAdminSlotsList() and updateBookingsList() will be called automatically by real-time listeners
    } catch (error) {
        console.error('Error deleting slot:', error);
        alert('Error deleting time slot. Please try again.');
    }
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
        // Recalculate displayDate from date string to ensure accuracy
        const displayDate = formatDisplayDateFromString(date);
        
        html += `
            <div class="date-group">
                <h4>${displayDate}</h4>
                ${dateSlots.map(slot => {
                    const slotBookings = bookings.filter(b => b.slotId === slot.id);
                    const bookingCount = slotBookings.length;
                    // Handle both camelCase and lowercase column names
                    const slotLength = slot.slotLength || slot.slotlength || 30;
                    
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
        // Recalculate displayDate from date string to ensure accuracy
        const displayDate = formatDisplayDateFromString(slot.date);
        
        html += `
            <div class="booking-item">
                <div class="booking-details">
                    <div class="booking-date-time">
                        <strong>${displayDate}</strong> at <strong>${formatTimeForDisplay(slot.time)}</strong>
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

// Delete individual booking (async to work with Supabase)
async function deleteBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const slot = timeSlots.find(s => s.id === booking.slotId);
    if (!slot) return;
    
    // Recalculate displayDate from date string to ensure accuracy
    const displayDate = formatDisplayDateFromString(slot.date);
    
    if (!confirm(`Are you sure you want to delete the booking for ${booking.name} on ${displayDate} at ${formatTimeForDisplay(slot.time)}?`)) {
        return;
    }
    
    try {
        const supabase = window.supabase;
        const { error } = await supabase
            .from(TABLE_BOOKINGS)
            .delete()
            .eq('id', bookingId);
        
        if (error) {
            console.error('Error deleting booking:', error);
            alert('Error deleting booking. Please try again.');
            return;
        }
        
        // Note: updateBookingsList() and updateAdminSlotsList() will be called automatically by real-time listeners
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Please try again.');
    }
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

// Make functions available globally for onclick handlers
window.generateTimeSlots = generateTimeSlots;
window.confirmGenerateSlots = confirmGenerateSlots;
window.cancelPreview = cancelPreview;
window.deleteTimeSlot = deleteTimeSlot;
window.deleteBooking = deleteBooking;
window.copyBookingLink = copyBookingLink;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateBookingLink();
});
