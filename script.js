// Supabase table names (PostgreSQL converts to lowercase)
const TABLE_SLOTS = 'timeslots';
const TABLE_BOOKINGS = 'bookings';

// Initialize data structures
let timeSlots = [];
let bookings = [];
let slotsSubscription = null;
let bookingsSubscription = null;

// Load data from Supabase on page load
async function loadData() {
    // Wait for Supabase to initialize
    if (!window.supabase) {
        setTimeout(loadData, 100);
        return;
    }
    
    // Set up real-time subscriptions for slots and bookings
    setupRealtimeListeners();
}

// Set up real-time listeners for Supabase data
function setupRealtimeListeners() {
    const supabase = window.supabase;
    
    // Listen for time slots changes
    slotsSubscription = supabase
        .channel('time-slots-changes')
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
        .channel('bookings-changes')
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
            const container = document.getElementById('timeSlotsContainer');
            container.innerHTML = '<p class="loading">Error loading time slots. Please check your Supabase configuration.</p>';
            return;
        }
        
        timeSlots = data || [];
        displayTimeSlots();
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
        displayTimeSlots(); // Refresh display when bookings change
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

// Display Time Slots
function displayTimeSlots() {
    const container = document.getElementById('timeSlotsContainer');
    
    if (timeSlots.length === 0) {
        container.innerHTML = '<p class="loading">No viewing times available at the moment. Please check back later.</p>';
        return;
    }
    
    // Group slots by date
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
            <div class="time-slot-group">
                <h3>${displayDate}</h3>
                <div class="time-slots-grid">
                    ${dateSlots.map(slot => {
                        const slotBookings = bookings.filter(b => b.slotId === slot.id);
                        const isBooked = slotBookings.length > 0;
                        
                        return `
                            <div class="time-slot ${isBooked ? 'booked' : 'available'}" 
                                 ${isBooked ? '' : `onclick="openBookingModal('${slot.id}')"`}>
                                <div class="time">${formatTimeForDisplay(slot.time)}</div>
                                <div class="status">${isBooked ? 'Booked' : 'Available'}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Open Booking Modal
function openBookingModal(slotId) {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return;
    
    // Check if slot is already booked (prevent race conditions)
    const slotBookings = bookings.filter(b => b.slotId === slotId);
    if (slotBookings.length > 0) {
        alert('Sorry, this time slot has already been booked by someone else.');
        // Refresh display to show updated status
        displayTimeSlots();
        return;
    }
    
    const detailsDiv = document.getElementById('bookingDetails');
    // Recalculate displayDate from date string to ensure accuracy
    const displayDate = formatDisplayDateFromString(slot.date);
    detailsDiv.innerHTML = `
        <div class="info-box">
            <p><strong>Date:</strong> ${displayDate}</p>
            <p><strong>Time:</strong> ${formatTimeForDisplay(slot.time)}</p>
        </div>
    `;
    
    // Store selected slot ID
    document.getElementById('bookingForm').dataset.slotId = slotId;
    
    // Show modal
    document.getElementById('bookingModal').classList.remove('hidden');
    
    // Reset form
    document.getElementById('bookingForm').reset();
}

// Close Booking Modal
function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
}

// Submit Booking (async to work with Supabase)
async function submitBooking(event) {
    event.preventDefault();
    
    const form = document.getElementById('bookingForm');
    const slotId = form.dataset.slotId;
    
    // Double-check if slot is still available (prevent double bookings)
    const slotBookings = bookings.filter(b => b.slotId === slotId);
    if (slotBookings.length > 0) {
        alert('Sorry, this time slot has already been booked by someone else. Please select another time.');
        closeBookingModal();
        displayTimeSlots();
        return;
    }
    
    // Create booking object
    const booking = {
        slotId: slotId,
        name: document.getElementById('visitorName').value,
        email: document.getElementById('visitorEmail').value,
        phone: document.getElementById('visitorPhone').value,
        notes: document.getElementById('visitorNotes').value,
        bookingDate: new Date().toISOString()
    };
    
    try {
        // Save to Supabase
        const supabase = window.supabase;
        const { data, error } = await supabase
            .from(TABLE_BOOKINGS)
            .insert([booking])
            .select();
        
        if (error) {
            console.error('Error saving booking:', error);
            alert('Sorry, there was an error saving your booking. Please try again.');
            return;
        }
        
        // Close booking modal
        closeBookingModal();
        
        // Show success modal
        document.getElementById('successModal').classList.remove('hidden');
        
        // Note: displayTimeSlots() will be called automatically by the real-time listener
    } catch (error) {
        console.error('Error saving booking:', error);
        alert('Sorry, there was an error saving your booking. Please try again.');
    }
}

// Close Success Modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
}

// Make functions available globally for onclick handlers
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.closeSuccessModal = closeSuccessModal;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Close modals when clicking outside
    window.onclick = function(event) {
        const bookingModal = document.getElementById('bookingModal');
        const successModal = document.getElementById('successModal');
        
        if (event.target === bookingModal) {
            closeBookingModal();
        }
        if (event.target === successModal) {
            closeSuccessModal();
        }
    }
});
