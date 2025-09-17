// Utility functions for account type management

export type AccountType = 'customer' | 'vendor';

/**
 * Validates if a user has the required account type
 */
export function hasAccountType(user: { account_type?: AccountType } | null, requiredType: AccountType): boolean {
  if (!user || !user.account_type) {
    return false;
  }
  return user.account_type === requiredType;
}

/**
 * Checks if user is a customer
 */
export function isCustomer(user: { account_type?: AccountType } | null): boolean {
  return hasAccountType(user, 'customer');
}

/**
 * Checks if user is a vendor
 */
export function isVendor(user: { account_type?: AccountType } | null): boolean {
  return hasAccountType(user, 'vendor');
}

/**
 * Gets the account type display name
 */
export function getAccountTypeDisplayName(accountType: AccountType): string {
  switch (accountType) {
    case 'customer':
      return 'Customer';
    case 'vendor':
      return 'Vendor';
    default:
      return 'Unknown';
  }
}

/**
 * Validates account type access for specific routes
 */
export function validateAccountAccess(
  user: { account_type?: AccountType } | null, 
  requiredType: AccountType,
  redirectPath?: string
): { isAllowed: boolean; redirectTo?: string } {
  if (!user) {
    return { isAllowed: false, redirectTo: '/login' };
  }
  
  if (!hasAccountType(user, requiredType)) {
    return { 
      isAllowed: false, 
      redirectTo: redirectPath || (requiredType === 'vendor' ? '/vendor/login' : '/') 
    };
  }
  
  return { isAllowed: true };
}

