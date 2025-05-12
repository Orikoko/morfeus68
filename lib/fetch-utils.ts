import NodeCache from 'node-cache';

// Shared cache instance
export const apiCache = new NodeCache({ stdTTL: 3600 });

interface FetchWithRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  timeout?: number;
  headers?: Record<string, string>;
  cache?: {
    key: string;
    ttl?: number;
  };
}

const defaultHeaders = {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0',
};

export async function fetchWithRetry<T>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 12,
    baseDelay = 5000,
    timeout = 15000,
    headers = {},
    cache,
  } = options;

  // Check cache first if cache key provided
  if (cache?.key) {
    const cachedData = apiCache.get<T>(cache.key);
    if (cachedData) {
      return cachedData;
    }
  }

  let lastError: Error | null = null;
  let currentController: AbortController | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Abort previous request if it exists
      if (currentController) {
        currentController.abort();
      }
      
      // Create new controller for this attempt
      currentController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (currentController) {
          currentController.abort();
        }
      }, timeout);

      const response = await fetch(url, {
        signal: currentController.signal,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status}`;
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
          console.warn(`Rate limited. Waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (cache?.key) {
        apiCache.set(cache.key, data, cache.ttl);
      }

      return data;
    } catch (error) {
      lastError = error as Error;
      
      const errorDetails = {
        attempt: attempt + 1,
        maxRetries,
        url,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          cause: (error as any).cause
        } : error
      };
      
      console.warn('Fetch attempt failed:', JSON.stringify(errorDetails, null, 2));
      
      if (attempt === maxRetries - 1) {
        console.error('All retry attempts failed:', errorDetails);
        throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
      }
      
      const jitter = Math.random() * 3000;
      const delay = baseDelay * Math.pow(2, attempt) + jitter;
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}