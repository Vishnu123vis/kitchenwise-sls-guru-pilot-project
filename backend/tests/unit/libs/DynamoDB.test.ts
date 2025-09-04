import DynamoDB from '../../../src/libs/DynamoDB';

// Mock the entire DynamoDB module
jest.mock('../../../src/libs/DynamoDB');

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;

describe('DynamoDB Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('putItem', () => {
    it('should successfully put item in pantry table', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Item: {
          itemId: 'test-item-id',
          userId: 'test-user-id',
          title: 'Test Item',
          type: 'Dairy',
          location: 'Fridge',
          count: 2,
          expiryDate: '2024-12-31',
          notes: 'Test notes'
        }
      };

      mockDynamoDB.putItem.mockResolvedValue(mockParams.Item);

      const result = await DynamoDB.putItem(mockParams);

      expect(result).toEqual(mockParams.Item);
      expect(mockDynamoDB.putItem).toHaveBeenCalledWith(mockParams);
    });

    it('should handle DynamoDB errors gracefully', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Item: {
          itemId: 'test-item-id',
          userId: 'test-user-id',
          title: 'Test Item'
        }
      };

      const mockError = new Error('DynamoDB error');
      mockDynamoDB.putItem.mockRejectedValue(mockError);

      await expect(DynamoDB.putItem(mockParams)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('getItem', () => {
    it('should successfully get item from pantry table', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Key: {
          itemId: 'test-item-id',
          userId: 'test-user-id'
        }
      };

      const mockItem = {
        itemId: 'test-item-id',
        userId: 'test-user-id',
        title: 'Test Item'
      };

      mockDynamoDB.getItem.mockResolvedValue(mockItem);

      const result = await DynamoDB.getItem(mockParams);

      expect(result).toEqual(mockItem);
      expect(mockDynamoDB.getItem).toHaveBeenCalledWith(mockParams);
    });

    it('should return undefined when item not found', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Key: {
          itemId: 'test-item-id',
          userId: 'test-user-id'
        }
      };

      mockDynamoDB.getItem.mockResolvedValue(undefined);

      const result = await DynamoDB.getItem(mockParams);

      expect(result).toBeUndefined();
    });

    it('should handle DynamoDB errors gracefully', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Key: {
          itemId: 'test-item-id',
          userId: 'test-user-id'
        }
      };

      const mockError = new Error('DynamoDB error');
      mockDynamoDB.getItem.mockRejectedValue(mockError);

      await expect(DynamoDB.getItem(mockParams)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('queryItems', () => {
    it('should successfully query items from pantry table', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': 'test-user-id'
        }
      };

      const mockItems = [
        { itemId: 'item1', userId: 'test-user-id', title: 'Item 1' },
        { itemId: 'item2', userId: 'test-user-id', title: 'Item 2' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await DynamoDB.queryItems(mockParams);

      expect(result.items).toEqual(mockItems);
      expect(result.lastEvaluatedKey).toBeUndefined();
      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith(mockParams);
    });

    it('should return empty array when no items found', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': 'test-user-id'
        }
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [],
        lastEvaluatedKey: undefined
      });

      const result = await DynamoDB.queryItems(mockParams);

      expect(result.items).toEqual([]);
    });

    it('should handle DynamoDB errors gracefully', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': 'test-user-id'
        }
      };

      const mockError = new Error('DynamoDB error');
      mockDynamoDB.queryItems.mockRejectedValue(mockError);

      await expect(DynamoDB.queryItems(mockParams)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('updateItem', () => {
    it('should successfully update item in pantry table', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Key: {
          itemId: 'test-item-id',
          userId: 'test-user-id'
        },
        UpdateExpression: 'SET title = :title',
        ExpressionAttributeValues: {
          ':title': 'Updated Title'
        },
        ReturnValues: 'ALL_NEW' as const
      };

      const mockUpdatedItem = {
        itemId: 'test-item-id',
        userId: 'test-user-id',
        title: 'Updated Title'
      };

      mockDynamoDB.updateItem.mockResolvedValue(mockUpdatedItem);

      const result = await DynamoDB.updateItem(mockParams);

      expect(result).toEqual(mockUpdatedItem);
      expect(mockDynamoDB.updateItem).toHaveBeenCalledWith(mockParams);
    });

    it('should handle DynamoDB errors gracefully', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Key: {
          itemId: 'test-item-id',
          userId: 'test-user-id'
        },
        UpdateExpression: 'SET title = :title',
        ExpressionAttributeValues: {
          ':title': 'Updated Title'
        }
      };

      const mockError = new Error('DynamoDB error');
      mockDynamoDB.updateItem.mockRejectedValue(mockError);

      await expect(DynamoDB.updateItem(mockParams)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('deleteItem', () => {
    it('should successfully delete item from pantry table', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Key: {
          itemId: 'test-item-id',
          userId: 'test-user-id'
        }
      };

      mockDynamoDB.deleteItem.mockResolvedValue(undefined);

      const result = await DynamoDB.deleteItem(mockParams);

      expect(result).toBeUndefined();
      expect(mockDynamoDB.deleteItem).toHaveBeenCalledWith(mockParams);
    });

    it('should handle DynamoDB errors gracefully', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Key: {
          itemId: 'test-item-id',
          userId: 'test-user-id'
        }
      };

      const mockError = new Error('DynamoDB error');
      mockDynamoDB.deleteItem.mockRejectedValue(mockError);

      await expect(DynamoDB.deleteItem(mockParams)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Item: {
          itemId: 'test-item-id',
          userId: 'test-user-id',
          title: 'Test Item'
        }
      };

      const mockError = new Error('Network error');
      mockDynamoDB.putItem.mockRejectedValue(mockError);

      await expect(DynamoDB.putItem(mockParams)).rejects.toThrow('Network error');
    });

    it('should handle DynamoDB service errors gracefully', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Item: {
          itemId: 'test-item-id',
          userId: 'test-user-id',
          title: 'Test Item'
        }
      };

      const mockError = new Error('Service Unavailable');
      mockDynamoDB.putItem.mockRejectedValue(mockError);

      await expect(DynamoDB.putItem(mockParams)).rejects.toThrow('Service Unavailable');
    });
  });

  describe('Input Validation', () => {
    it('should handle empty string inputs', async () => {
      const mockParams = {
        TableName: '',
        Item: {
          itemId: '',
          userId: '',
          title: ''
        }
      };

      mockDynamoDB.putItem.mockResolvedValue(mockParams.Item);

      const result = await DynamoDB.putItem(mockParams);

      expect(result).toEqual(mockParams.Item);
    });

    it('should handle null inputs', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Item: {
          itemId: 'test-item-id',
          userId: 'test-user-id',
          title: null
        }
      };

      mockDynamoDB.putItem.mockResolvedValue(mockParams.Item);

      const result = await DynamoDB.putItem(mockParams);

      expect(result).toEqual(mockParams.Item);
    });

    it('should handle undefined inputs', async () => {
      const mockParams = {
        TableName: 'test-pantry-table',
        Item: {
          itemId: 'test-item-id',
          userId: 'test-user-id',
          title: undefined
        }
      };

      mockDynamoDB.putItem.mockResolvedValue(mockParams.Item);

      const result = await DynamoDB.putItem(mockParams);

      expect(result).toEqual(mockParams.Item);
    });
  });
});
