import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

// Track current AbortController
let currentAbortController: AbortController | null = null;

// Create axios instance with custom config
const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Configure retry behavior with fresh request creation
axiosRetry(apiClient, {
  retries: 8,
  retryDelay: (retryCount) => {
    const baseDelay = 3000;
    const jitter = Math.random() * 2000;
    return baseDelay * Math.pow(2, retryCount) + jitter;
  },
  import { AxiosError } from 'axios';

retryCondition: (error: AxiosError): boolean => {
  return (
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    (!!error.response?.status && error.response.status >= 500) ||
    error.response?.status === 429
  );
},

  },
  // Create a fresh axios request for each retry
  shouldResetTimeout: true,
  onRetry: (retryCount, error, requestConfig) => {
    // Cancel any existing request
    if (currentAbortController) {
      currentAbortController.abort();
    }

    // Create new AbortController for the retry
    currentAbortController = new AbortController();
    requestConfig.signal = currentAbortController.signal;

    console.warn(
      `Retry attempt ${retryCount} for ${requestConfig.url}:`,
      error.message
    );
  }
});

// Add request interceptor to handle AbortController
apiClient.interceptors.request.use((config) => {
  // Cancel any existing requests
  if (currentAbortController) {
    currentAbortController.abort();
  }

  // Create new AbortController for this request
  currentAbortController = new AbortController();
  config.signal = currentAbortController.signal;

  return config;
});

export default apiClient;