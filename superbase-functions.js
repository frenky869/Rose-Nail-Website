// supabase-functions.js
// Supabase Database Functions for Rose Nails

// =================== APPOINTMENT FUNCTIONS ===================
async function createAppointment(appointmentData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('appointments')
            .insert([appointmentData])
            .select()
            .single();

        if (error) throw error;
        
        return { success: true, data, message: 'Appointment created successfully!' };
    } catch (error) {
        console.error('Error creating appointment:', error);
        return { 
            success: false, 
            message: error.message || 'Failed to create appointment' 
        };
    }
}

async function checkAvailability(date, time) {
    try {
        const { data, error } = await window.supabaseClient
            .from('appointments')
            .select('*')
            .eq('appointment_date', date)
            .eq('appointment_time', time)
            .in('status', ['pending', 'confirmed']);

        if (error) throw error;
        
        // If there are 2 or more appointments at the same time, consider it booked
        return { 
            success: true, 
            available: data.length < 2,
            conflictingAppointments: data.length
        };
    } catch (error) {
        console.error('Error checking availability:', error);
        return { success: false, available: false };
    }
}

// =================== SERVICE FUNCTIONS ===================
async function getAllServices() {
    try {
        const { data, error } = await window.supabaseClient
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('category')
            .order('price');

        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching services:', error);
        return { success: false, data: [] };
    }
}

// =================== UTILITY FUNCTIONS ===================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function validatePhoneNumber(phone) {
    // Kenyan phone number validation
    const regex = /^(?:(?:\+?254)|(?:0))[17]\d{8}$/;
    return regex.test(phone.replace(/\s+/g, ''));
}

function validateBookingForm(formData) {
    const errors = [];
    
    if (!formData.name?.trim()) errors.push('Name is required');
    if (!formData.phone?.trim()) errors.push('Phone number is required');
    if (!validatePhoneNumber(formData.phone)) {
        errors.push('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
    }
    if (!formData.service) errors.push('Please select a service');
    if (!formData.date) errors.push('Please select a date');
    if (!formData.time) errors.push('Please select a time');
    
    // Check if date is in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        errors.push('Please select a future date');
    }
    
    // Check if it's Sunday
    if (selectedDate.getDay() === 0) {
        errors.push('We are closed on Sundays. Please select another day.');
    }
    
    return errors;
}

// =================== EXPORT FUNCTIONS ===================
window.supabaseFunctions = {
    createAppointment,
    checkAvailability,
    getAllServices,
    formatDate,
    validatePhoneNumber,
    validateBookingForm
};
