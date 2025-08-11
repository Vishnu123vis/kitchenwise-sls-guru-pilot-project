import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { DashboardStats } from '../types/dashboard';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Delay function for retry logic
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff retry
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    // Wait with exponential backoff
    await delay(delayMs);
    return retryWithBackoff(fn, retries - 1, delayMs * 2);
  }
};

async function getAccessToken() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return token;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication failed. Please sign in again.');
  }
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return retryWithBackoff(async () => {
    try {
      // Validate authentication first
      const accessToken = await getAccessToken();
      
      console.log('Making API call to /dashboard/stats endpoint...');
      
      const restOperation = get({ 
        apiName: 'KitchenWiseAPI', 
        path: '/dashboard/stats', 
        options: { 
          headers: { 
            Authorization: accessToken,
            'Content-Type': 'application/json'
          } 
        }
      });
      
      console.log('REST operation created, awaiting response...');
      
      // Add timeout to prevent hanging requests
      const responsePromise = restOperation.response;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      const response = await Promise.race([responsePromise, timeoutPromise]);
      
      console.log('Response received, parsing body...');
      
      // Type guard for response object
      if (!response || typeof response !== 'object' || !('body' in response)) {
        throw new Error('Invalid response structure from API');
      }
      
      const responseWithBody = response as { body: { json(): Promise<unknown> } };
      const { body } = responseWithBody;
      if (!body) {
        throw new Error('No response body received from API');
      }
      
      const data = await body.json();
      console.log('API response data:', data);

      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from dashboard API');
      }

      // Basic validation of required fields
      const requiredFields = ['overview', 'locationBreakdown', 'typeBreakdown', 'expiryAlerts', 'inventoryInsights'];
      for (const field of requiredFields) {
        if (!(field in data)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Type guard function to validate DashboardStats structure
      const isValidDashboardStats = (obj: unknown): obj is DashboardStats => {
        if (!obj || typeof obj !== 'object' || obj === null) {
          return false;
        }
        
        const requiredKeys = ['overview', 'locationBreakdown', 'typeBreakdown', 'expiryAlerts', 'inventoryInsights'];
        return requiredKeys.every(key => key in obj);
      };

      if (!isValidDashboardStats(data)) {
        throw new Error('Invalid dashboard stats structure received from API');
      }

      console.log('Dashboard stats successfully validated and parsed');
      return data;
      
    } catch (error) {
      console.error('Dashboard API call failed:', error);
      
      // Provide specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('Network Error')) {
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        }
        if (error.message.includes('Request timeout')) {
          throw new Error('Request timed out. The server is taking too long to respond. Please try again.');
        }
        if (error.message.includes('Authentication failed')) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        if (error.message.includes('No authentication token')) {
          throw new Error('Please sign in to access dashboard data.');
        }
        if (error.message.includes('Invalid response format')) {
          throw new Error('Received invalid data from server. Please try again later.');
        }
        if (error.message.includes('Missing required field')) {
          throw new Error('Server returned incomplete data. Please try again later.');
        }
        if (error.message.includes('Invalid dashboard stats structure')) {
          throw new Error('Server returned data in unexpected format. Please try again later.');
        }
      }
      
      // Generic error for unknown issues
      throw new Error('Failed to fetch dashboard data. Please try again later.');
    }
  });
};
