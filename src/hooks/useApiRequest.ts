import { useState, useEffect, useCallback, useRef } from 'react';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<any>>();

export function useApiRequest<T>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    dependencies?: any[];
    cacheTime?: number; // in milliseconds
    enabled?: boolean;
  }
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    method = 'GET',
    body,
    headers,
    dependencies = [],
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    enabled = true
  } = options || {};

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Create cache key
    const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.timestamp + cached.expiry) {
      setData(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const requestOptions: RequestInit = {
        method,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        expiry: cacheTime
      });

      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers, enabled, cacheTime]);

  useEffect(() => {
    fetchData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}

// Clear cache utility
export const clearApiCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Preload data utility
export const preloadApiData = async <T>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    cacheTime?: number;
  }
): Promise<T | null> => {
  const {
    method = 'GET',
    body,
    headers,
    cacheTime = 5 * 60 * 1000
  } = options || {};

  const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;
  
  try {
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      expiry: cacheTime
    });

    return result;
  } catch (error) {
    console.error('Preload error:', error);
    return null;
  }
};