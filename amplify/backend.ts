import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */

const backend = defineBackend({
  auth,
  data,
});

backend.addOutput({
  custom: {
    api_id: "ni7czy4s82", // API Gateway ID for KitchenWise
    api_endpoint: "https://ni7czy4s82.execute-api.us-east-2.amazonaws.com",
    api_name: "KitchenWiseAPI",
  },
});
