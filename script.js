// Data Storage - Using localStorage for simplicity
const STORAGE_KEY_SLOTS = 'viewingTimeSlots';
const STORAGE_KEY_BOOKINGS = 'viewingBookings';

// Initialize data structures
let timeSlots = [];
let bookings = [];

// Load data from localStorage on page load
function loadData() {
    const savedSlots = localStorage.getItem(STORAGE_KEY_SLOTS);
    const savedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    
    if (savedSlots) {
        timeSlots = JSON.parse(savedSlots);
    }
    
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    }
    
    // Initialize with sample data if empty
    if (timeSlots.length === 0) {
        initializeSampleData();
    }
    
    displayTimeSlots();
    updateAdminSlotsList();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(timeSlots));
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
}

// Initialize with sample time slots (for demo) - Only if no slots exist
function initializeSampleData() {
    // Don't initialize if slots already exist
    if (timeSlots.length > 0) {
        return;
    }
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    timeSlots = [
        {
            id: generateId(),
            date: formatDate(tomorrow),
            time: '10:00',
            displayDate: formatDisplayDate(tomorrow),
            slotLength: 30
        },
        {
            id: generateId(),
            date: formatDate(tomorrow),
            time: '14:00',
            displayDate: formatDisplayDate(tomorrow),
            slotLength: 30
        },
        {
            id: generateId(),
            date: formatDate(dayAfter),
            time: '10:00',
            displayDate: formatDisplayDate(dayAfter),
            slotLength: 30
        },
        {
            id: generateId(),
            date: formatDate(dayAfter),
            time: '14:00',
            displayDate: formatDisplayDate(dayAfter),
            slotLength: 30
        }
    ];
    
    saveData();
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
        const displayDate = dateSlots[0].displayDate;
        
        html += `
            <div class="time-slot-group">
                <h3>${displayDate}</h3>
                <div class="time-slots-grid">
                    ${dateSlots.map(slot => {
                        const slotBookings = bookings.filter(b => b.slotId === slot.id);
                        const isBooked = slotBookings.length > 0;
                        
                        return `
                            <div class="time-slot ${isBooked ? 'booked' : 'available'}" 
                                 onclick="${isBooked ? '' : `openBookingModal('${slot.id}')`}">
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
    
    const detailsDiv = document.getElementById('bookingDetails');
    detailsDiv.innerHTML = `
        <div class="info-box">
            <p><strong>Date:</strong> ${slot.displayDate}</p>
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

// Submit Booking
function submitBooking(event) {
    event.preventDefault();
    
    const form = document.getElementById('bookingForm');
    const slotId = form.dataset.slotId;
    
    // Check if slot is still available
    const slotBookings = bookings.filter(b => b.slotId === slotId);
    if (slotBookings.length > 0) {
        alert('Sorry, this time slot has already been booked.');
        closeBookingModal();
        displayTimeSlots();
        return;
    }
    
    // Create booking
    const booking = {
        id: generateId(),
        slotId: slotId,
        name: document.getElementById('visitorName').value,
        email: document.getElementById('visitorEmail').value,
        phone: document.getElementById('visitorPhone').value,
        notes: document.getElementById('visitorNotes').value,
        bookingDate: new Date().toISOString()
    };
    
    bookings.push(booking);
    saveData();
    
    // Close booking modal
    closeBookingModal();
    
    // Show success modal
    document.getElementById('successModal').classList.remove('hidden');
    
    // Refresh display
    displayTimeSlots();
    updateAdminSlotsList();
}

// Close Success Modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Set minimum date to today for admin date input
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('adminDate').setAttribute('min', today);
    
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

