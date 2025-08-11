import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { DashboardStats } from '../types/dashboard';

async function getAccessToken() {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() || null;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { headers: { Authorization: accessToken } } : undefined;
  
  const restOperation = get({ 
    apiName: 'KitchenWiseAPI', 
    path: '/dashboard-stats', 
    options 
  });
  
  const { body } = await (await restOperation.response);
  const data = await body.json();

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

  return data;
};
