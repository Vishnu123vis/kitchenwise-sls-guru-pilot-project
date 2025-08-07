import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommandInput,
  PutCommandInput,
  UpdateCommandInput,
  DeleteCommandInput,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const getItem = async <T = any>(params: GetCommandInput): Promise<T | undefined> => {
  try {
    const result = await client.send(new GetCommand(params));
    return result.Item as T | undefined;
  } catch (error) {
    console.error('DynamoDB getItem error:', error, 'Params:', params);
    throw error;
  }
};

export const putItem = async <T = any>(params: PutCommandInput): Promise<T> => {
  try {
    await client.send(new PutCommand(params));
    return params.Item as T;
  } catch (error) {
    console.error('DynamoDB putItem error:', error, 'Params:', params);
    throw error;
  }
};

export const updateItem = async <T = any>(params: UpdateCommandInput): Promise<T | undefined> => {
  try {
    const result = await client.send(new UpdateCommand(params));
    return result.Attributes as T | undefined;
  } catch (error) {
    console.error('DynamoDB updateItem error:', error, 'Params:', params);
    throw error;
  }
};

export const deleteItem = async (params: DeleteCommandInput): Promise<void> => {
  try {
    await client.send(new DeleteCommand(params));
  } catch (error) {
    console.error('DynamoDB deleteItem error:', error, 'Params:', params);
    throw error;
  }
};

export const queryItems = async <T = any>(params: QueryCommandInput): Promise<{ items: T[]; lastEvaluatedKey?: any }> => {
  try {
    const result = await client.send(new QueryCommand(params));
    return {
      items: (result.Items as T[]) || [],
      lastEvaluatedKey: result.LastEvaluatedKey, //returns the last item in the query
    };
  } catch (error) {
    console.error('DynamoDB queryItems error:', error, 'Params:', params);
    throw error;
  }
};

export default {
  getItem,
  putItem,
  updateItem,
  deleteItem,
  queryItems,
};
