import { APIGatewayProxyHandler } from 'aws-lambda';
import { httpResponse } from '../../libs/APIResponses';

export const handler: APIGatewayProxyHandler = async (event) => {
  return httpResponse({
    statusCode: 200,
    body: { message: 'Lambda Connected to Frontend' },
  });
};
