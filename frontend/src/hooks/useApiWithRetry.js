import { useState, useCallback } from 'react';
import { useRetry } from './useRetry';
import { useOffline } from './useOffline';

export const useApiWithRetry = (apiFunction, options = {}) => {
  const { maxRetries = 3, delay = 1000 } = options;
  const { retry, retryCount, isRetrying, canRetry, reset } = useRetry(maxRetries, delay);
  const { isOffline } = useOffline();
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...args) => {
    if (isOffline) {
      setError(new Error('You are offline. Please check your internet connection.'));
      return;
    }

    setLoading(true);
    setError(null);
    reset();

    try {
      const result = await retry(apiFunction, ...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, retry, reset, isOffline]);

  const retryLastRequest = useCallback(async () => {
    if (!canRetry) return;
    
    setError(null);
    setLoading(true);
    
    try {
      const result = await retry(apiFunction);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, retry, canRetry]);

  return {
    data,
    error,
    loading: loading || isRetrying,
    retryCount,
    canRetry,
    execute,
    retry: retryLastRequest,
    reset
  };
};
