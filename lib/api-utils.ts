import { apiCache } from './fetch-utils';
import apiClient from './api-client';
import { handleApiError, generateFallbackData } from './error-handler';
import type { MarketData } from './market-data';

interface FetchOptions {
  fallbackData?: any;
  cacheKey?: string;
  cacheTTL?: number;
}

export async function fetchWithFallback<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { fallbackData, cacheKey, cacheTTL = 3600 } = options;

  try {
    // Check cache first
    if (cacheKey) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Make API request
    const response = await apiClient.get<T>(url);
    const data = response.data;

    // Cache successful response
    if (cacheKey) {
      apiCache.set(cacheKey, data, cacheTTL);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);

    // Check cache again as fallback
    if (cacheKey) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached data for ${url}`);
        return cachedData;
      }
    }

    // Use provided fallback data or generate default
    if (fallbackData) {
      return fallbackData;
    }

    throw handleApiError(error);
  }
}

export async function fetchMarketData(pair: string): Promise<MarketData> {
  const cacheKey = `market-data-${pair}`;
  
  try {
    return await fetchWithFallback<MarketData>(
      `/api/fx-prices`,
      {
        cacheKey,
        cacheTTL: 300, // 5 minutes
        fallbackData: generateFallbackData<MarketData>('price')
      }
    );
  } catch (error) {
    console.error(`Failed to fetch market data for ${pair}:`, error);
    return generateFallbackData<MarketData>('price');
  }
}

export function sanitizePair(pair: string): string {
  return pair.replace('/', '').toUpperCase();
}

export function formatPrice(price: number): string {
  return price.toFixed(4);
}

export function calculateChange(current: number, previous: number): number {
  return ((current - previous) / previous) * 100;
}