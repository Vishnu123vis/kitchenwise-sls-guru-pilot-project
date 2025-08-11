import { get, post, put, del } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { PantryItem } from '../types/pantry';

// Define proper types for API responses
interface PaginationKey {
  [key: string]: string | number;
}

interface ListResponse {
  items: PantryItem[];
  lastEvaluatedKey?: PaginationKey;
}

// Type guard to check if response is a valid PantryItem
function isPantryItem(obj: unknown): obj is PantryItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'userId' in obj &&
    'itemId' in obj &&
    'title' in obj &&
    'type' in obj &&
    'location' in obj &&
    'expiryDate' in obj &&
    'count' in obj
  );
}

// Type guard to check if response is a valid ListResponse
function isListResponse(obj: unknown): obj is ListResponse {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    'items' in obj
  ) {
    const objWithItems = obj as { items: unknown };
    return (
      Array.isArray(objWithItems.items) &&
      objWithItems.items.every(isPantryItem)
    );
  }
  return false;
}

async function getAccessToken() {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() || null;
}

export const listPantryItems = async (
  lastEvaluatedKey?: PaginationKey, 
  type?: string, 
  location?: string
): Promise<ListResponse> => {
  const accessToken = await getAccessToken();
  let path = '/pantry-items';
  const params = new URLSearchParams();
  
  if (lastEvaluatedKey) {
    params.append('lastEvaluatedKey', JSON.stringify(lastEvaluatedKey));
  }
  if (type) {
    params.append('type', type);
  }
  if (location) {
    params.append('location', location);
  }
  
  if (params.toString()) {
    path += `?${params.toString()}`;
  }
  
  const options = accessToken ? { headers: { Authorization: accessToken } } : undefined;
  const restOperation = get({ apiName: 'KitchenWiseAPI', path, options });
  const { body } = await (await restOperation.response);
  const data = await body.json();
  
  if (!isListResponse(data)) {
    throw new Error('Invalid response format from API');
  }
  
  return data;
};

export const getPantryItem = async (itemId: string): Promise<PantryItem> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { headers: { Authorization: accessToken } } : undefined;
  const restOperation = get({ apiName: 'KitchenWiseAPI', path: `/pantry-items/${itemId}`, options });
  const { body } = await (await restOperation.response);
  const data = await body.json();
  
  if (!data || !isPantryItem(data)) {
    throw new Error('Item not found or invalid format');
  }
  
  return data;
};

export const createPantryItem = async (item: Omit<PantryItem, 'userId' | 'itemId'>): Promise<PantryItem> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { body: item, headers: { Authorization: accessToken } } : { body: item };
  const restOperation = post({ apiName: 'KitchenWiseAPI', path: '/pantry-items', options });
  const { body } = await (await restOperation.response);
  const data = await body.json();
  
  if (!data || !isPantryItem(data)) {
    throw new Error('Create failed or invalid response format');
  }
  
  return data;
};

export const updatePantryItem = async (itemId: string, item: Partial<Omit<PantryItem, 'userId' | 'itemId'>>): Promise<PantryItem> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { body: item, headers: { Authorization: accessToken } } : { body: item };
  const restOperation = put({ apiName: 'KitchenWiseAPI', path: `/pantry-items/${itemId}`, options });
  const { body } = await (await restOperation.response);
  const data = await body.json();
  
  if (!data || !isPantryItem(data)) {
    throw new Error('Update failed or invalid response format');
  }
  
  return data;
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { headers: { Authorization: accessToken } } : undefined;
  const restOperation = del({ apiName: 'KitchenWiseAPI', path: `/pantry-items/${itemId}`, options });
  await restOperation.response;
};
