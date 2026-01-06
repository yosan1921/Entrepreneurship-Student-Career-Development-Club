/**
 * Date utility functions for consistent date handling
 */

/**
 * Parse date string in YYYY-MM-DD format to Date object
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Date} - Date object in local timezone
 */
export const parseInputDate = (dateString) => {
    if (!dateString) return null;

    // Ensure the date string is in YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        console.warn('Invalid date format. Expected YYYY-MM-DD, got:', dateString);
        return null;
    }

    const [year, month, day] = dateString.split('-').map(Number);

    // Validate date components
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        console.warn('Invalid date components:', { year, month, day });
        return null;
    }

    return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Format Date object to YYYY-MM-DD string for HTML input
 * @param {Date} date - Date object
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Get today's date without time component
 * @returns {Date} - Today's date at 00:00:00
 */
export const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

/**
 * Check if a date is in the past
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} - True if date is in the past
 */
export const isDateInPast = (dateString) => {
    if (!dateString) return false;

    try {
        const eventDate = parseInputDate(dateString);
        const today = getTodayDate();

        // Debug logging
        console.log('Date validation:', {
            input: dateString,
            eventDate: eventDate,
            today: today,
            isPast: eventDate < today
        });

        return eventDate < today;
    } catch (error) {
        console.error('Error in date validation:', error);
        return false;
    }
};

/**
 * Format date for display (DD/MM/YYYY)
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {string} - Date in DD/MM/YYYY format
 */
export const formatDateForDisplay = (date) => {
    if (!date) return '';

    const d = typeof date === 'string' ? parseInputDate(date) : new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Combine date and time strings into ISO datetime string
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} - ISO datetime string
 */
export const combineDateAndTime = (dateString, timeString) => {
    if (!dateString || !timeString) return null;

    return `${dateString}T${timeString}:00`;
};

/**
 * Parse datetime string and extract date and time components
 * @param {string} datetimeString - ISO datetime string
 * @returns {object} - Object with date and time strings
 */
export const parseDateTimeString = (datetimeString) => {
    if (!datetimeString) return { date: '', time: '' };

    const dt = new Date(datetimeString);
    const date = formatDateForInput(dt);
    const time = dt.toTimeString().slice(0, 5); // HH:MM format

    return { date, time };
};