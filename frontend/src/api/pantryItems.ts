import { get, post, put, del } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { PantryItem } from '../types/pantry';

async function getAccessToken() {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() || null;
}

export const listPantryItems = async (
  lastEvaluatedKey?: any, 
  type?: string, 
  location?: string
): Promise<{ items: PantryItem[]; lastEvaluatedKey?: any }> => {
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
  return data as unknown as { items: PantryItem[]; lastEvaluatedKey?: any };
};

export const getPantryItem = async (itemId: string): Promise<PantryItem> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { headers: { Authorization: accessToken } } : undefined;
  const restOperation = get({ apiName: 'KitchenWiseAPI', path: `/pantry-items/${itemId}`, options });
  const { body } = await (await restOperation.response);
  const data = await body.json();
  if (!data) throw new Error('Item not found');
  return data as unknown as PantryItem;
};

export const createPantryItem = async (item: Omit<PantryItem, 'userId' | 'itemId'>): Promise<PantryItem> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { body: item, headers: { Authorization: accessToken } } : { body: item };
  const restOperation = post({ apiName: 'KitchenWiseAPI', path: '/pantry-items', options });
  const { body } = await (await restOperation.response);
  const data = await body.json();
  if (!data) throw new Error('Create failed');
  return data as unknown as PantryItem;
};

export const updatePantryItem = async (itemId: string, item: Partial<Omit<PantryItem, 'userId' | 'itemId'>>): Promise<PantryItem> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { body: item, headers: { Authorization: accessToken } } : { body: item };
  const restOperation = put({ apiName: 'KitchenWiseAPI', path: `/pantry-items/${itemId}`, options });
  const { body } = await (await restOperation.response);
  const data = await body.json();
  if (!data) throw new Error('Update failed');
  return data as unknown as PantryItem;
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  const accessToken = await getAccessToken();
  const options = accessToken ? { headers: { Authorization: accessToken } } : undefined;
  const restOperation = del({ apiName: 'KitchenWiseAPI', path: `/pantry-items/${itemId}`, options });
  await restOperation.response;
};
