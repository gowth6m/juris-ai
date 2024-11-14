import { format, isToday, subDays, isYesterday, startOfToday } from 'date-fns';

/**
 * Function to format date time string to a more readable format
 * - Example: 2021-10-01T12:00:00 => 10/01/2021 12:00:00
 */
export function formatDateTime(dateTime: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: undefined,
    hour12: true,
    timeZoneName: undefined,
  };

  const date = new Date(dateTime);
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString(undefined, options);
}

/**
 * Function to format date time string to a more readable format
 * - Example: 2 days ago, 3 weeks ago, 4 months ago, 5 years ago
 */
export function formatDateTimeAgo(dateTime: string): string {
  const currentTime = new Date();
  const time = new Date(dateTime);
  const timeDifference = time.getTime() - currentTime.getTime();

  const seconds = Math.abs(timeDifference) / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const weeks = days / 7;
  const months = weeks / 4;
  const years = months / 12;

  if (timeDifference > 0) {
    if (seconds < 60) {
      return 'now';
    } else if (minutes < 60) {
      return `In ${Math.floor(minutes)} mins`;
    } else if (hours < 24) {
      return `In ${Math.floor(hours)} hours`;
    } else if (days < 7) {
      return `In ${Math.floor(days)} days`;
    } else if (weeks < 4) {
      return `In ${Math.floor(weeks)} weeks`;
    } else if (months < 12) {
      return `In ${Math.floor(months)} months`;
    } else {
      return `In ${Math.floor(years)} years`;
    }
  } else {
    // Handle past dates
    if (seconds < 60) {
      return 'now';
    } else if (minutes < 60) {
      return `${Math.floor(minutes)} mins ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)} hours ago`;
    } else if (days < 7) {
      return `${Math.floor(days)} days ago`;
    } else if (weeks < 4) {
      return `${Math.floor(weeks)} weeks ago`;
    } else if (months < 12) {
      return `${Math.floor(months)} months ago`;
    } else {
      return `${Math.floor(years)} years ago`;
    }
  }
}

/**
 * Formats a date string to a more readable format for message previews
 * - If the date is today, return the time
 * - If the date is yesterday, return "Yesterday"
 * - If the date is within the last 6 days, return the day of the week
 * - Otherwise, return the date in MM/dd/yy format
 *
 * @param timestamp String representation of a date in ISO format
 * @returns Formatted date string
 */
export const formatDateForMessagePreview = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, 'p');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (date >= subDays(startOfToday(), 6)) {
    return format(date, 'EEEE');
  } else {
    return format(date, 'MM/dd/yy');
  }
};

/**
 * Capitalize the first letter of a string
 *
 * @param string A string to capitalize
 * @returns Formatted string
 */
export const capitalizeFirstLetter = (string: string | undefined) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Convert empty strings to null in an object
 *
 * @param obj An object to convert empty strings to null
 * @returns Object with empty strings converted to null
 */
export function convertEmptyStringsToNull(obj: any): any {
  // Check if the value is an object (and not null)
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    // Iterate over the object keys
    Object.keys(obj).forEach((key) => {
      // Recursively apply the function if the value is an object
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        convertEmptyStringsToNull(obj[key]);
      } else if (obj[key] === '') {
        // Convert empty string to null
        obj[key] = null;
      }
    });
  }
  return obj;
}
