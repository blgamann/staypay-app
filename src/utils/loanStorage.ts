// Local Storage utility for loan activities

export interface LoanActivity {
  id: string;
  type: 'issued' | 'repaid' | 'overdue';
  amount: number;
  principal?: number;
  repaidAmount?: number;
  fee?: number;
  duration?: number;
  daysOverdue?: number;
  status?: 'active' | 'repaid';
  timestamp: number;
  address?: string;
  txHash?: string;
}

const STORAGE_KEY = 'staypay_loan_activities';

// Get all loan activities from localStorage
export const getLoanActivities = (): LoanActivity[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading loan activities:', error);
    return [];
  }
};

// Save loan activities to localStorage
export const saveLoanActivities = (activities: LoanActivity[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving loan activities:', error);
  }
};

// Add a new loan activity
export const addLoanActivity = (activity: Omit<LoanActivity, 'id' | 'timestamp'>) => {
  const activities = getLoanActivities();
  const newActivity: LoanActivity = {
    ...activity,
    id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  activities.unshift(newActivity); // Add to beginning
  saveLoanActivities(activities);
  return newActivity;
};

// Update a loan to repaid status
export const updateLoanToRepaid = (principal: number, fee: number, address?: string) => {
  const activities = getLoanActivities();
  
  console.log('Trying to update loan to repaid:', { principal, fee, address });
  console.log('Current activities:', activities);
  
  // Find the most recent active loan with matching principal or amount
  const loanIndex = activities.findIndex(
    a => {
      const isIssued = a.type === 'issued';
      const isActive = a.status === 'active';
      // Check both amount and principal fields for matching
      const amountMatches = (a.principal && Math.abs(a.principal - principal) < 0.01) || 
                           (a.amount && Math.abs(a.amount - principal) < 0.01);
      const addressMatches = !address || !a.address || a.address === address;
      
      console.log('Checking activity:', a.id, {
        isIssued,
        isActive, 
        amountMatches,
        addressMatches,
        activityPrincipal: a.principal,
        activityAmount: a.amount,
        searchPrincipal: principal
      });
      
      return isIssued && isActive && amountMatches && addressMatches;
    }
  );
  
  if (loanIndex !== -1) {
    console.log('Found matching loan at index:', loanIndex);
    // Calculate duration
    const issuedTime = activities[loanIndex].timestamp;
    const duration = Math.floor((Date.now() - issuedTime) / (1000 * 60 * 60 * 24)) || 1; // At least 1 day
    
    // Update the loan to repaid
    activities[loanIndex] = {
      ...activities[loanIndex],
      type: 'repaid',
      status: 'repaid',
      amount: activities[loanIndex].amount || principal, // Keep original amount for display
      principal: principal,
      repaidAmount: principal + fee,
      fee: fee,
      duration: duration,
    };
    
    saveLoanActivities(activities);
    return activities[loanIndex];
  } else {
    console.log('No matching loan found, creating new repaid entry');
    // If no matching loan found, create a new repaid entry
    return addLoanActivity({
      type: 'repaid',
      amount: principal,
      principal: principal,
      repaidAmount: principal + fee,
      fee: fee,
      duration: 1,
      status: 'repaid',
      address,
    });
  }
};

// Clear all loan activities
export const clearLoanActivities = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Get formatted time string
export const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
};