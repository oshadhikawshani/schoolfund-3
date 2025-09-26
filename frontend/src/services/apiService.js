import api from '../lib/api';

class ApiService {
  constructor() {
    this.defaultRetryOptions = {
      maxRetries: 3,
      delay: 1000
    };
  }

  // Enhanced request method with retry logic
  async request(config, retryOptions = {}) {
    const options = { ...this.defaultRetryOptions, ...retryOptions };
    let lastError;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        const response = await api(config);
        return response;
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === options.maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delay = options.delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Determine if an error should not be retried
  shouldNotRetry(error) {
    const status = error?.response?.status;
    
    // Don't retry on client errors (4xx) except 408, 429
    if (status >= 400 && status < 500 && ![408, 429].includes(status)) {
      return true;
    }

    // Don't retry on authentication errors
    if (status === 401 || status === 403) {
      return true;
    }

    return false;
  }

  // GET request with retry
  async get(url, config = {}, retryOptions = {}) {
    return this.request({ ...config, method: 'GET', url }, retryOptions);
  }

  // POST request with retry
  async post(url, data = {}, config = {}, retryOptions = {}) {
    return this.request({ ...config, method: 'POST', url, data }, retryOptions);
  }

  // PUT request with retry
  async put(url, data = {}, config = {}, retryOptions = {}) {
    return this.request({ ...config, method: 'PUT', url, data }, retryOptions);
  }

  // DELETE request with retry
  async delete(url, config = {}, retryOptions = {}) {
    return this.request({ ...config, method: 'DELETE', url }, retryOptions);
  }

  // Batch requests with individual retry logic
  async batch(requests, retryOptions = {}) {
    const promises = requests.map(request => 
      this.request(request, retryOptions).catch(error => ({ error }))
    );

    const results = await Promise.all(promises);
    
    // Separate successful results from errors
    const successful = results.filter(result => !result.error);
    const failed = results.filter(result => result.error);

    return {
      successful,
      failed,
      hasErrors: failed.length > 0
    };
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.get('/api/health', {}, { maxRetries: 1 });
      return { status: 'healthy', response };
    } catch (error) {
      return { status: 'unhealthy', error };
    }
  }
}

export default new ApiService();
