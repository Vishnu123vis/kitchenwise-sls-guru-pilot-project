interface GatewayResponse {
    statusCode: number;
    body: string;
    headers?: { [key: string]: string };
  }
  
  export const httpResponse = ({
    statusCode = 200,
    body,
    headers,
  }: {
    statusCode?: number;
    body: any;
    headers?: { [key: string]: string };
  }) =>
    ({
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        ...headers,
      },
      statusCode,
      body: JSON.stringify(body),
    } as GatewayResponse);