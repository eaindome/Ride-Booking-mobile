/**
 * Format a date string or timestamp into a user-friendly format
 */
export function formatDate(date: string | number | Date): string {
    const dateObj = new Date(date);
    
    // Today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Yesterday's date for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format options
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };
    
    const fullOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    
    // Check if date is today
    if (dateObj.setHours(0, 0, 0, 0) === today.getTime()) {
      return `Today, ${dateObj.toLocaleTimeString('en-US', timeOptions)}`;
    }
    
    // Check if date is yesterday
    if (dateObj.setHours(0, 0, 0, 0) === yesterday.getTime()) {
      return `Yesterday, ${dateObj.toLocaleTimeString('en-US', timeOptions)}`;
    }
    
    // Check if date is within the current year
    if (dateObj.getFullYear() === today.getFullYear()) {
      return dateObj.toLocaleDateString('en-US', dateOptions) + 
             ` at ${dateObj.toLocaleTimeString('en-US', timeOptions)}`;
    }
    
    // For older dates, include the year
    return dateObj.toLocaleDateString('en-US', fullOptions);
  }
  
  /**
   * Format a number as currency (USD)
   */
  export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
  
  /**
   * Format distance in miles or kilometers
   */
  export function formatDistance(distance: number, unit: 'mi' | 'km' = 'mi'): string {
    const formattedDistance = distance.toFixed(1);
    return `${formattedDistance} ${unit}`;
  }
  
  /**
   * Format duration in minutes
   */
  export function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  }
  
  /**
   * Truncate text with ellipsis
   */
  export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  /**
   * Group ride history by date
   */
  export function groupRidesByDate(rides: any[]) {
    const groups: Record<string, any[]> = {};
    
    rides.forEach(ride => {
      const date = new Date(ride.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(ride);
    });
    
    // Convert to array format for section list
    return Object.keys(groups).map(date => {
      return {
        title: formatGroupDate(date),
        data: groups[date]
      };
    }).sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.data[0].date).getTime() - new Date(a.data[0].date).getTime();
    });
  }
  
  /**
   * Format the group date headers
   */
  function formatGroupDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today
    if (date.getTime() === today.getTime()) {
      return "Today";
    }
    
    // Check if date is yesterday
    if (date.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }
    
    // For this week
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const isThisWeek = date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000;
    
    if (isThisWeek) {
      return dayOfWeek;
    }
    
    // For recent dates
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
    
    // For older dates
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }