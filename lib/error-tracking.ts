export function initErrorTracking() {
  if (typeof window !== 'undefined') {
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.error('Client Error:', {
        message: msg,
        url: url,
        lineNo: lineNo,
        columnNo: columnNo,
        error: error
      });
      return false;
    };
  }
} 