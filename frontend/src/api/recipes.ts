import { get, post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { 
  GenerateRecipeRequest, 
  GenerateRecipeResponse, 
  StarredRecipesResponse, 
  StarRecipeRequest 
} from '../types/recipe';

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
    console.log(`retryWithBackoff: Attempting function call (retries left: ${retries})`);
    return await fn();
  } catch (error) {
    console.log(`retryWithBackoff: Function failed with error:`, error);
    console.log(`retryWithBackoff: Error type:`, typeof error);
    console.log(`retryWithBackoff: Error constructor:`, error?.constructor?.name);
    
    if (retries <= 0) {
      console.log(`retryWithBackoff: No retries left, throwing error`);
      throw error;
    }

    console.log(`retryWithBackoff: Waiting ${delayMs}ms before retry...`);
    // Wait with exponential backoff
    await delay(delayMs);
    console.log(`retryWithBackoff: Retrying...`);
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

export const generateRecipe = async (request: GenerateRecipeRequest): Promise<GenerateRecipeResponse> => {
  return retryWithBackoff(async () => {
    try {
      const accessToken = await getAccessToken();
      
      console.log('Generating recipe with constraint:', request.constraint);
      console.log('Access token obtained:', accessToken ? 'Yes' : 'No');
      
      const restOperation = post({ 
        apiName: 'KitchenWiseAPI', 
        path: '/recipes/generate', 
        options: { 
          headers: { 
            Authorization: accessToken
          },
          body: JSON.stringify(request) // Convert back to string to fix type error
        }
      });
      
      console.log('REST operation created, awaiting response...');
      
      // Remove Promise.race and use direct response handling
      const response = await restOperation.response;
      console.log('Response received:', response);
      
      if (!response || typeof response !== 'object') {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response structure from API');
      }
      
      // Check if response has a body property
      if (!('body' in response)) {
        console.error('Response missing body property:', response);
        throw new Error('Response missing body property');
      }
      
      // Parse the response body
      let data: GenerateRecipeResponse;
      try {
        const rawData = await response.body.json();
        if (!rawData) {
          throw new Error('Empty response body received');
        }
        data = rawData as unknown as GenerateRecipeResponse;
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response body:', parseError);
        throw new Error('Failed to parse API response');
      }

      if (!data || typeof data !== 'object') {
        console.error('Invalid response data format:', data);
        throw new Error('Invalid response format from recipe generation API');
      }

      // Validate required fields
      const requiredFields = ['recipeId', 'title', 'description', 'imageUrl', 'constraint'];
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        console.error('Received data:', data);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('Recipe generated successfully:', data);
      return data as GenerateRecipeResponse;
      
    } catch (error) {
      console.error('Recipe generation error details:', {
        error,
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      if (error instanceof Error) {
        throw new Error(`Failed to generate recipe: ${error.message}`);
      }
      throw new Error('Failed to generate recipe: Unknown error occurred');
    }
  });
};

export const starRecipe = async (request: StarRecipeRequest): Promise<void> => {
  return retryWithBackoff(async () => {
    try {
      console.log('=== STAR RECIPE DEBUG START ===');
      console.log('1. Starting starRecipe function');
      console.log('2. Request object:', JSON.stringify(request, null, 2));
      
      const accessToken = await getAccessToken();
      console.log('3. Access token obtained:', accessToken ? 'Yes' : 'No');
      
      console.log('4. Creating REST operation...');
      const restOperation = post({ 
        apiName: 'KitchenWiseAPI', 
        path: '/starred-recipes', 
        options: { 
          headers: { 
            Authorization: accessToken
          },
          body: JSON.stringify(request)
        }
      });
      
      console.log('5. REST operation created:', restOperation);
      console.log('6. Awaiting response...');
      
      const response = await restOperation.response;
      console.log('7. Response received:', response);
      console.log('8. Response type:', typeof response);
      console.log('9. Response keys:', Object.keys(response || {}));
      
      if (!response || typeof response !== 'object') {
        console.error('10. Invalid response structure:', response);
        throw new Error('Invalid response structure from API');
      }
      
      console.log('11. Checking response status...');
      console.log('12. Response statusCode:', response.statusCode);
      console.log('13. Response has body:', 'body' in response);
      
      // Check for HTTP errors (4xx, 5xx status codes)
      if (response.statusCode >= 400) {
        console.log('14. HTTP error detected, parsing error body...');
        let errorBody: { error?: string } = {};
        try {
          const rawErrorBody = await response.body.json();
          console.log('15. Raw error body:', rawErrorBody);
          if (rawErrorBody && typeof rawErrorBody === 'object' && 'error' in rawErrorBody) {
            errorBody = rawErrorBody as { error?: string };
          }
        } catch (parseError) {
          console.warn('16. Could not parse error response body as JSON:', parseError);
        }
        const errorMessage = `API Error: ${response.statusCode} - ${errorBody.error || 'Unknown API error'}`;
        console.log('17. Throwing error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('18. No HTTP errors, parsing response body...');
      // Parse the response body to ensure success
      try {
        const responseData = await response.body.json();
        console.log('19. Response data parsed:', responseData);
        
        if (!responseData || typeof responseData !== 'object') {
          throw new Error('Invalid response structure from API: Missing expected fields for starred recipe');
        }
        
        // Type-safe check for recipeId
        const typedResponse = responseData as { recipeId?: string };
        if (!typedResponse.recipeId) {
          throw new Error('Invalid response structure from API: Missing recipeId field');
        }
        
        console.log('20. Response validation passed');
      } catch (parseError) {
        console.warn('21. Could not parse response body as JSON:', parseError);
        // This might be okay if the response doesn't have a body
      }
      
      console.log('22. Recipe starred successfully');
      console.log('=== STAR RECIPE DEBUG END ===');
      
    } catch (error) {
      console.log('=== STAR RECIPE ERROR DEBUG ===');
      console.log('Error object:', error);
      console.log('Error type:', typeof error);
      console.log('Error constructor:', error?.constructor?.name);
      console.log('Error message:', error instanceof Error ? error.message : 'No message');
      console.log('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.log('Error keys:', Object.keys(error || {}));
      console.log('Error stringified:', JSON.stringify(error, null, 2));
      
      console.error('Star recipe error details:', {
        error,
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      if (error instanceof Error) {
        throw new Error(`Failed to star recipe: ${error.message}`);
      }
      throw new Error('Failed to star recipe: Unknown error occurred');
    }
  });
};

export const getStarredRecipes = async (): Promise<StarredRecipesResponse> => {
  return retryWithBackoff(async () => {
    try {
      const accessToken = await getAccessToken();
      
      console.log('Fetching starred recipes...');
      
      const restOperation = get({ 
        apiName: 'KitchenWiseAPI', 
        path: '/starred-recipes', 
        options: { 
          headers: { 
            Authorization: accessToken
          } 
        }
      });
      
      console.log('Get starred recipes REST operation created, awaiting response...');
      
      const response = await restOperation.response;
      console.log('Get starred recipes response received:', response);
      
      if (!response || typeof response !== 'object' || !('body' in response)) {
        console.error('Invalid get starred recipes response structure:', response);
        throw new Error('Invalid response structure from API');
      }
      
      // Parse the response body
      let data: StarredRecipesResponse;
      try {
        const rawData = await response.body.json();
        if (!rawData) {
          throw new Error('Empty response body received');
        }
        data = rawData as unknown as StarredRecipesResponse;
        console.log('Parsed starred recipes data:', data);
      } catch (parseError) {
        console.error('Failed to parse starred recipes response body:', parseError);
        throw new Error('Failed to parse API response');
      }

      if (!data || typeof data !== 'object') {
        console.error('Invalid starred recipes response data format:', data);
        throw new Error('Invalid response format from starred recipes API');
      }

      // Validate required fields
      const requiredFields = ['items', 'temporaryRecipes', 'permanentRecipes', 'totalCount', 'temporaryCount', 'permanentCount'];
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length > 0) {
        console.error('Missing required fields in starred recipes:', missingFields);
        console.error('Received starred recipes data:', data);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('Starred recipes fetched successfully:', data);
      return data as StarredRecipesResponse;
      
    } catch (error) {
      console.error('Get starred recipes error details:', {
        error,
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch starred recipes: ${error.message}`);
      }
      throw new Error('Failed to fetch starred recipes: Unknown error occurred');
    }
  });
};
