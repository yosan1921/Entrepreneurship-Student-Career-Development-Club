/**
 * DateTime utility functions for proper timezone handling
 */

/**
 * Combine date and time inputs into a proper DateTime object
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timeStr - Time in HH:MM format
 * @returns {Date} - Date object in local timezone
 */
export const combineDateAndTime = (dateStr, timeStr = '00:00') => {
    if (!dateStr) return null;

    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Create Date object in local timezone
    return new Date(year, month - 1, day, hours, minutes);
};

/**
 * Convert Date object to MySQL datetime format
 * @param {Date} dateObj - Date object
 * @returns {string} - MySQL datetime string (YYYY-MM-DD HH:MM:SS)
 */
export const toMySQLDateTime = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return null;

    // Convert to MySQL format: YYYY-MM-DD HH:MM:SS
    return dateObj.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Check if a datetime is in the past
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timeStr - Time in HH:MM format
 * @returns {boolean} - True if datetime is in the past
 */
export const isDateTimeInPast = (dateStr, timeStr = '00:00') => {
    const eventDateTime = combineDateAndTime(dateStr, timeStr);
    if (!eventDateTime) return false;

    const now = new Date();
    return eventDateTime < now;
};

/**
 * Parse MySQL datetime string back to date and time components
 * @param {string} mysqlDateTime - MySQL datetime string (YYYY-MM-DD HH:MM:SS)
 * @returns {object} - Object with date and time strings
 */
export const parseMySQLDateTime = (mysqlDateTime) => {
    if (!mysqlDateTime) return { date: '', time: '' };

    const [datePart, timePart] = mysqlDateTime.split(' ');
    const timeOnly = timePart ? timePart.slice(0, 5) : '00:00'; // HH:MM format

    return {
        date: datePart || '',
        time: timeOnly
    };
};

/**
 * Format datetime for display
 * @param {string} mysqlDateTime - MySQL datetime string
 * @returns {string} - Formatted datetime string
 */
export const formatDateTimeForDisplay = (mysqlDateTime) => {
    if (!mysqlDateTime) return '';

    const dateObj = new Date(mysqlDateTime.replace(' ', 'T'));
    if (isNaN(dateObj.getTime())) return '';

    return dateObj.toLocaleString();
};