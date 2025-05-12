// Error types
export type ApiError = {
  code: string;
  message: string;
  details?: any;
};

// Error codes
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

// Error handler
export function handleApiError(error: any): ApiError {
  if (error.response) {
    // Server responded with error status
    return {
      code: ErrorCodes.API_ERROR,
      message: error.response.data?.message || 'Server error occurred',
      details: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    if (error.code === 'ECONNABORTED') {
      return {
        code: ErrorCodes.TIMEOUT_ERROR,
        message: 'Request timed out'
      };
    }
    return {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Network error occurred'
    };
  } else {
    // Error in request setup
    return {
      code: ErrorCodes.VALIDATION_ERROR,
      message: error.message
    };
  }
}

// Fallback data generator
export function generateFallbackData<T>(type: string): T {
  switch (type) {
    case 'price':
      return {
        price: 0,
        change: 0,
        volume: 0,
        timestamp: new Date().toISOString()
      } as unknown as T;
    
    case 'sentiment':
      return {
        sentiment: 'neutral',
        value: 50,
        timestamp: new Date().toISOString()
      } as unknown as T;
    
    default:
      return {} as T;
  }
}