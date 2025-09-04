import { httpResponse } from '../../../src/libs/APIResponses';

describe('APIResponses Tests', () => {
  describe('httpResponse', () => {
    it('should create a successful response with default values', () => {
      const result = httpResponse({
        body: { message: 'Success' }
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBe(JSON.stringify({ message: 'Success' }));
      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['Content-Type']).toBe('application/json');
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
        expect(result.headers['Access-Control-Allow-Methods']).toBe('*');
        expect(result.headers['Access-Control-Allow-Headers']).toBe('Content-Type,Authorization');
      }
    });

    it('should create a response with custom status code', () => {
      const result = httpResponse({
        statusCode: 201,
        body: { id: '123' }
      });
      
      expect(result.statusCode).toBe(201);
      expect(result.body).toBe(JSON.stringify({ id: '123' }));
    });

    it('should create a response with custom headers', () => {
      const customHeaders = {
        'Content-Type': 'text/plain',
        'X-Custom': 'value'
      };
      
      const result = httpResponse({
        body: 'Custom response',
        headers: customHeaders
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('"Custom response"');
      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['Content-Type']).toBe('text/plain');
        expect(result.headers['X-Custom']).toBe('value');
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
        expect(result.headers['Access-Control-Allow-Methods']).toBe('*');
        expect(result.headers['Access-Control-Allow-Headers']).toBe('Content-Type,Authorization');
      }
    });

    it('should create an error response', () => {
      const result = httpResponse({
        statusCode: 400,
        body: { error: 'Bad Request' }
      });
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toBe(JSON.stringify({ error: 'Bad Request' }));
    });

    it('should create a response with string body', () => {
      const result = httpResponse({
        body: 'String response'
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('"String response"');
    });

    it('should create a response with number body', () => {
      const result = httpResponse({
        body: 42
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('42');
    });

    it('should create a response with boolean body', () => {
      const result = httpResponse({
        body: true
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('true');
    });

    it('should create a response with null body', () => {
      const result = httpResponse({
        body: null
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('null');
    });

    it('should create a response with undefined body', () => {
      const result = httpResponse({
        body: undefined
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBe(undefined);
    });

    it('should merge custom headers with default CORS headers', () => {
      const customHeaders = {
        'X-Test': 'value'
      };
      
      const result = httpResponse({
        body: { data: 'test' },
        headers: customHeaders
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
        expect(result.headers['Access-Control-Allow-Methods']).toBe('*');
        expect(result.headers['Access-Control-Allow-Headers']).toBe('Content-Type,Authorization');
        expect(result.headers['X-Test']).toBe('value');
      }
    });

    it('should handle empty custom headers', () => {
      const result = httpResponse({
        body: { data: 'test' },
        headers: {}
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['Content-Type']).toBe('application/json');
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      }
    });

    it('should handle undefined custom headers', () => {
      const result = httpResponse({
        body: { data: 'test' }
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['Content-Type']).toBe('application/json');
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      }
    });

    it('should preserve CORS headers when adding custom headers', () => {
      const result = httpResponse({
        body: { message: 'Test' },
        headers: { 'X-Test': 'value' }
      });

      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
        expect(result.headers['Access-Control-Allow-Methods']).toBe('*');
        expect(result.headers['X-Test']).toBe('value');
      }
    });
  });

  describe('Response Body Formatting', () => {
    it('should properly stringify complex objects', () => {
      const complexData = {
        user: {
          id: 123,
          name: 'John Doe',
          preferences: {
            theme: 'dark',
            language: 'en'
          }
        },
        timestamp: new Date('2024-01-01').toISOString()
      };

      const result = httpResponse({
        body: complexData
      });

      const parsedBody = JSON.parse(result.body);
      expect(parsedBody).toEqual(complexData);
    });

    it('should handle nested arrays and objects', () => {
      const nestedData = {
        categories: [
          { id: 1, name: 'Category 1', items: ['item1', 'item2'] },
          { id: 2, name: 'Category 2', items: ['item3', 'item4'] }
        ],
        metadata: {
          total: 2,
          created: '2024-01-01'
        }
      };

      const result = httpResponse({
        body: nestedData
      });

      expect(JSON.parse(result.body)).toEqual(nestedData);
    });

    it('should handle special characters in strings', () => {
      const specialData = {
        message: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        path: '/api/v1/users/123',
        query: '?filter=active&sort=name'
      };

      const result = httpResponse({
        body: specialData
      });

      expect(JSON.parse(result.body)).toEqual(specialData);
    });

    it('should handle unicode characters', () => {
      const unicodeData = {
        message: 'Unicode: 🚀 🌟 💻 🎉',
        name: 'José María',
        description: 'Café au lait'
      };

      const result = httpResponse({
        body: unicodeData
      });

      expect(JSON.parse(result.body)).toEqual(unicodeData);
    });
  });

  describe('Status Code Handling', () => {
    it('should accept valid HTTP status codes', () => {
      const validCodes = [200, 201, 400, 401, 403, 404, 422, 500, 503];
      
      validCodes.forEach(code => {
        const result = httpResponse({
          statusCode: code,
          body: { message: `Status ${code}` }
        });
        
        expect(result.statusCode).toBe(code);
      });
    });

    it('should handle zero status code', () => {
      const result = httpResponse({
        statusCode: 0,
        body: { message: 'Zero status' }
      });
      
      expect(result.statusCode).toBe(0);
    });

    it('should handle negative status code', () => {
      const result = httpResponse({
        statusCode: -1,
        body: { message: 'Negative status' }
      });
      
      expect(result.statusCode).toBe(-1);
    });

    it('should handle very large status codes', () => {
      const result = httpResponse({
        statusCode: 999999,
        body: { message: 'Large status' }
      });
      
      expect(result.statusCode).toBe(999999);
    });
  });

  describe('Header Merging', () => {
    it('should override default headers with custom ones', () => {
      const customHeaders = {
        'Content-Type': 'text/html',
        'X-Custom': 'custom-value'
      };

      const result = httpResponse({
        body: { message: 'Test' },
        headers: customHeaders
      });

      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['Content-Type']).toBe('text/html');
        expect(result.headers['X-Custom']).toBe('custom-value');
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      }
    });

    it('should preserve all CORS headers', () => {
      const result = httpResponse({
        body: { message: 'Test' }
      });

      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
        expect(result.headers['Access-Control-Allow-Methods']).toBe('*');
        expect(result.headers['Access-Control-Allow-Headers']).toBe('Content-Type,Authorization');
      }
    });

    it('should handle multiple custom headers', () => {
      const customHeaders = {
        'X-API-Version': 'v1',
        'X-Request-ID': 'req-123',
        'X-User-Agent': 'test-client'
      };

      const result = httpResponse({
        body: { message: 'Test' },
        headers: customHeaders
      });

      expect(result.headers).toBeDefined();
      if (result.headers) {
        expect(result.headers['X-API-Version']).toBe('v1');
        expect(result.headers['X-Request-ID']).toBe('req-123');
        expect(result.headers['X-User-Agent']).toBe('test-client');
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      }
    });
  });
});
