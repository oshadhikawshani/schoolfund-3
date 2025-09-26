import { useState, useCallback } from 'react';

export const useRetry = (maxRetries = 3, delay = 1000) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async (fn, ...args) => {
    if (retryCount >= maxRetries) {
      throw new Error(`Maximum retry attempts (${maxRetries}) exceeded`);
    }

    setIsRetrying(true);
    
    try {
      const result = await fn(...args);
      setRetryCount(0); // Reset on success
      return result;
    } catch (error) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      if (newRetryCount < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * newRetryCount));
        return retry(fn, ...args);
      } else {
        throw error;
      }
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, delay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
    reset
  };
};
