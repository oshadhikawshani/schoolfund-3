# Error Handling & User Experience Components

This directory contains comprehensive error handling and user experience improvements for the SchoolFund frontend application.

## 🚀 Quick Start

### 1. Install Required Dependencies

```bash
npm install react-icons
```

### 2. Import Components

```javascript
// Error handling
import ErrorBoundary from './components/ErrorBoundary';
import ErrorMessage, { InlineError, SuccessMessage } from './components/ErrorMessage';

// Loading states
import { 
  LoadingSpinner, 
  FullPageLoading, 
  SkeletonCampaignCard,
  CampaignGridSkeleton 
} from './components/LoadingStates';

// Offline handling
import OfflineIndicator from './components/OfflineIndicator';
import OfflineFallback from './components/OfflineFallback';
import { useOffline } from './hooks/useOffline';

// Retry mechanisms
import RetryButton from './components/RetryButton';
import { useRetry, useApiWithRetry } from './hooks/useRetry';
```

## 📁 File Structure

```
src/
├── components/
│   ├── ErrorBoundary.jsx          # Global error boundary
│   ├── ErrorMessage.jsx           # Enhanced error messages
│   ├── LoadingStates.jsx          # Loading spinners & skeletons
│   ├── OfflineIndicator.jsx       # Online/offline status bar
│   ├── OfflineFallback.jsx        # Offline fallback page
│   ├── RetryButton.jsx            # Retry button component
│   └── ExampleUsage.jsx           # Usage examples
├── hooks/
│   ├── useOffline.js              # Offline detection hook
│   ├── useRetry.js                # Retry logic hook
│   └── useApiWithRetry.js         # API with retry hook
└── services/
    └── apiService.js              # Enhanced API service
```

## 🎯 Usage Examples

### Error Boundary (Already Added to App.jsx)

```javascript
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <OfflineIndicator />
        {/* Your app content */}
      </Router>
    </ErrorBoundary>
  );
}
```

### Loading States

```javascript
import { CampaignGridSkeleton, FullPageLoading } from './components/LoadingStates';

// Show skeleton while loading
{loading ? (
  <CampaignGridSkeleton count={6} />
) : (
  <CampaignList campaigns={campaigns} />
)}

// Full page loading
{loading && <FullPageLoading message="Loading campaigns..." />}
```

### Error Messages

```javascript
import ErrorMessage from './components/ErrorMessage';

// Show error with retry
{error && (
  <ErrorMessage
    error={error}
    onRetry={handleRetry}
    onDismiss={() => setError(null)}
  />
)}
```

### Offline Detection

```javascript
import { useOffline } from './hooks/useOffline';
import OfflineFallback from './components/OfflineFallback';

function MyComponent() {
  const { isOffline } = useOffline();
  
  if (isOffline) {
    return <OfflineFallback onRetry={fetchData} />;
  }
  
  return <div>Your content</div>;
}
```

### API with Retry

```javascript
import { useApiWithRetry } from './hooks/useApiWithRetry';
import { fetchCampaigns } from './api/campaigns';

function CampaignList() {
  const {
    data: campaigns,
    error,
    loading,
    retryCount,
    canRetry,
    execute: fetchData,
    retry
  } = useApiWithRetry(fetchCampaigns, { maxRetries: 3 });

  return (
    <div>
      {loading && <CampaignGridSkeleton />}
      {error && <ErrorMessage error={error} onRetry={retry} />}
      {campaigns && <CampaignList campaigns={campaigns} />}
    </div>
  );
}
```

## 🔧 Configuration

### Error Boundary Configuration

The ErrorBoundary component automatically handles:
- JavaScript errors in component tree
- Network errors
- Development vs production error display
- Retry functionality
- Navigation to home page

### Retry Configuration

```javascript
// Custom retry options
const { retry } = useRetry({
  maxRetries: 5,        // Maximum retry attempts
  delay: 2000          // Base delay between retries (exponential backoff)
});
```

### API Service Configuration

```javascript
import apiService from './services/apiService';

// Use enhanced API service with automatic retry
const response = await apiService.get('/api/campaigns', {}, {
  maxRetries: 3,
  delay: 1000
});
```

## 🎨 Customization

### Error Message Variants

```javascript
<ErrorMessage
  error={error}
  variant="error"        // error, warning, info
  showRetry={true}       // Show retry button
  showDismiss={true}     // Show dismiss button
/>
```

### Loading State Sizes

```javascript
<LoadingSpinner size="sm" />   // Small
<LoadingSpinner size="md" />   // Medium (default)
<LoadingSpinner size="lg" />   // Large
<LoadingSpinner size="xl" />   // Extra large
```

### Skeleton Components

```javascript
<SkeletonCampaignCard />       // Campaign card skeleton
<SkeletonTable rows={5} />     // Table skeleton
<DashboardStatsSkeleton />     // Dashboard stats skeleton
<ProgressBarSkeleton />        // Progress bar skeleton
```

## 🚨 Error Types Handled

The system automatically handles different error types:

- **Network Errors**: Connection issues, timeouts
- **Authentication Errors**: 401, 403 status codes
- **Server Errors**: 5xx status codes
- **Not Found Errors**: 404 status codes
- **Client Errors**: 4xx status codes (with appropriate handling)

## 📱 Offline Support

The offline detection system:
- Monitors browser online/offline status
- Shows visual indicators when offline
- Provides fallback pages for offline scenarios
- Automatically retries when connection is restored

## 🔄 Retry Logic

The retry system includes:
- Exponential backoff (delays increase with each retry)
- Maximum retry limits
- Smart error detection (doesn't retry certain error types)
- Visual retry indicators
- Retry count tracking

## 🎯 Best Practices

1. **Wrap your app** with ErrorBoundary
2. **Use skeleton screens** instead of spinners for better UX
3. **Implement retry logic** for network requests
4. **Handle offline states** gracefully
5. **Provide clear error messages** with actionable steps
6. **Use consistent loading states** throughout the app

## 🐛 Debugging

In development mode, the ErrorBoundary shows detailed error information including:
- Error message and stack trace
- Component tree information
- Retry attempt count

## 📈 Performance

- Skeleton screens provide immediate visual feedback
- Retry logic prevents unnecessary API calls
- Offline detection reduces failed requests
- Error boundaries prevent app crashes

## 🔮 Future Enhancements

Potential improvements:
- Error reporting to external services (Sentry, etc.)
- Advanced caching strategies
- Progressive Web App features
- Real-time connection status
- Custom error analytics
