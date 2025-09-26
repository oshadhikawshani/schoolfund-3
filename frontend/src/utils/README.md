# Utils Directory

This directory contains utility functions that improve code quality, maintainability, and consistency across the application.

## 📁 Structure

```
src/utils/
├── constants.js      # Application constants and configuration
├── calculations.js   # Progress, badge, and statistical calculations
├── formatters.js     # Currency, date, and text formatting
├── validators.js     # Form validation utilities
├── helpers.js        # General helper functions
├── index.js          # Main export file
└── README.md         # This documentation
```

## 🚀 Quick Start

### Import All Utilities
```javascript
import { 
  calculateProgress, 
  formatCurrency, 
  validateEmail,
  BADGE_THRESHOLDS 
} from '../utils';
```

### Import Specific Modules
```javascript
import { calculateProgress } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { validateEmail } from '../utils/validators';
```

## 📊 Calculations

### Progress Calculations
```javascript
import { calculateProgress, calculateRemaining } from '../utils/calculations';

// Calculate campaign progress
const progress = calculateProgress(raised, goal); // Returns 0-100

// Calculate remaining amount needed
const remaining = calculateRemaining(raised, goal);
```

### Badge Calculations
```javascript
import { calculateDonorBadge, calculateBadgeProgress } from '../utils/calculations';

// Calculate donor badge based on total donations
const badge = calculateDonorBadge(totalAmount); // 'Bronze', 'Silver', 'Gold'

// Calculate progress towards next badge
const badgeProgress = calculateBadgeProgress(currentAmount, currentBadge);
```

### Date Calculations
```javascript
import { calculateDaysRemaining, isCampaignUrgent } from '../utils/calculations';

// Calculate days until deadline
const daysLeft = calculateDaysRemaining(deadline);

// Check if campaign is urgent (< 7 days)
const isUrgent = isCampaignUrgent(deadline);
```

## 💰 Formatters

### Currency Formatting
```javascript
import { formatCurrency, formatCurrencyWithSymbol } from '../utils/formatters';

// Format with currency symbol
const formatted = formatCurrency(25000); // "Rs. 25,000"

// Format with custom symbol
const custom = formatCurrencyWithSymbol(25000, '$'); // "$ 25,000"
```

### Date Formatting
```javascript
import { formatDate, formatRelativeTime, formatDateTime } from '../utils/formatters';

// Format date
const date = formatDate('2024-01-15'); // "January 15, 2024"

// Relative time
const relative = formatRelativeTime('2024-01-15'); // "2 days ago"

// Date and time
const datetime = formatDateTime('2024-01-15T10:30:00Z'); // "January 15, 2024 at 10:30 AM"
```

### Text Formatting
```javascript
import { formatTitleCase, truncateText, formatName } from '../utils/formatters';

// Title case
const title = formatTitleCase('hello world'); // "Hello World"

// Truncate text
const short = truncateText('Very long text...', 50); // "Very long text..."

// Format names
const name = formatName('john doe'); // "John Doe"
```

## ✅ Validators

### Form Validation
```javascript
import { validateEmail, validatePassword, validateRequired } from '../utils/validators';

// Validate email
const emailResult = validateEmail('user@example.com');
// { isValid: true, message: '' }

// Validate password
const passwordResult = validatePassword('password123');
// { isValid: false, message: 'Password must contain...' }

// Validate required field
const requiredResult = validateRequired(value, 'Name');
```

### Complete Form Validation
```javascript
import { validateCampaignForm, validateDonorForm } from '../utils/validators';

// Validate campaign form
const campaignValidation = validateCampaignForm({
  campaignName: 'Test Campaign',
  description: 'Test description',
  amount: 50000,
  deadline: '2024-12-31'
});
// { isValid: true, errors: {} }

// Validate donor form
const donorValidation = validateDonorForm({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});
```

## 🛠️ Helpers

### Array Operations
```javascript
import { removeDuplicates, groupBy, sortBy, filterBySearch } from '../utils/helpers';

// Remove duplicates
const unique = removeDuplicates(array, 'id');

// Group by key
const grouped = groupBy(campaigns, 'status');

// Sort array
const sorted = sortBy(campaigns, 'createdAt', 'desc');

// Filter by search
const filtered = filterBySearch(campaigns, 'education', ['title', 'description']);
```

### Storage Helpers
```javascript
import { storage, sessionStorage } from '../utils/helpers';

// Local storage
storage.set('userData', userData);
const userData = storage.get('userData', {});

// Session storage
sessionStorage.set('tempData', tempData);
const tempData = sessionStorage.get('tempData');
```

### Utility Functions
```javascript
import { debounce, throttle, deepClone, isEmpty } from '../utils/helpers';

// Debounce function calls
const debouncedSearch = debounce(searchFunction, 300);

// Throttle function calls
const throttledScroll = throttle(scrollFunction, 100);

// Deep clone objects
const cloned = deepClone(originalObject);

// Check if empty
const empty = isEmpty(object); // true/false
```

## 📋 Constants

### Using Constants
```javascript
import { BADGE_THRESHOLDS, TIME_CONSTANTS, VALIDATION } from '../utils/constants';

// Badge thresholds
const bronzeThreshold = BADGE_THRESHOLDS.BRONZE.MONETARY; // 20000

// Time constants
const urgentDays = TIME_CONSTANTS.URGENT_DAYS; // 7

// Validation rules
const minPasswordLength = VALIDATION.PASSWORD_MIN_LENGTH; // 6
```

## 🔄 Migration Guide

### Before (Old Code)
```javascript
// Inline calculations
const progress = Math.round((raised / goal) * 100);

// Hardcoded values
const isUrgent = daysRemaining <= 7;

// Inline formatting
const formattedAmount = `Rs. ${amount.toLocaleString()}`;

// Inline validation
if (!email.includes('@')) {
  setError('Invalid email');
}
```

### After (New Code)
```javascript
import { calculateProgress, isCampaignUrgent, formatCurrency, validateEmail } from '../utils';

// Use utility functions
const progress = calculateProgress(raised, goal);
const isUrgent = isCampaignUrgent(deadline);
const formattedAmount = formatCurrency(amount);
const emailValidation = validateEmail(email);
```

## 🎯 Benefits

1. **Consistency**: All calculations and formatting use the same logic
2. **Maintainability**: Changes to business logic only need to be made in one place
3. **Testability**: Utility functions can be easily unit tested
4. **Reusability**: Functions can be used across multiple components
5. **Type Safety**: Better error handling and validation
6. **Performance**: Optimized calculations and caching

## 🧪 Testing

Each utility function should be thoroughly tested:

```javascript
// Example test
import { calculateProgress } from '../utils/calculations';

describe('calculateProgress', () => {
  it('should calculate progress correctly', () => {
    expect(calculateProgress(5000, 10000)).toBe(50);
    expect(calculateProgress(0, 10000)).toBe(0);
    expect(calculateProgress(15000, 10000)).toBe(100);
  });
});
```

## 📝 Best Practices

1. **Always use constants** instead of magic numbers
2. **Use utility functions** for calculations and formatting
3. **Validate inputs** before processing
4. **Handle edge cases** (null, undefined, invalid values)
5. **Keep functions pure** (no side effects)
6. **Document complex logic** with comments
7. **Use TypeScript** for better type safety (if available)

## 🔧 Customization

You can extend the utilities by:

1. **Adding new functions** to existing modules
2. **Creating new modules** for specific domains
3. **Modifying constants** for different configurations
4. **Adding new validators** for specific use cases

## 📚 Examples

See `RefactoredCampaignCard.jsx` for a complete example of how to use these utilities in a React component.
