const dynamodb = require('@aws-sdk/client-dynamodb');
console.log('DynamoDB exports:');
console.log(Object.keys(dynamodb).filter(k => k.includes('Command')));
