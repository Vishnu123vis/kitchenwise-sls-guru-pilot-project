"use client";
import { Amplify } from "aws-amplify";
import { parseAmplifyConfig } from "aws-amplify/utils";
import outputs from "../../../amplify_outputs.json";

const amplifyConfig = parseAmplifyConfig(outputs);

console.log('Amplify outputs:', outputs);
console.log('Amplify parsed config:', amplifyConfig);

Amplify.configure({
  ...amplifyConfig,
  API: {
    ...(amplifyConfig.API || {}),
    REST: {
      ...(amplifyConfig.API?.REST || {}),
      [outputs.custom.api_name]: {
        endpoint: outputs.custom.api_endpoint,
        region: "us-east-2",
      }
    }
  }
}, { ssr: true });

console.log('Amplify config at runtime:', Amplify.getConfig());

export default function ConfigureAmplifyClientSide() {
  return null;
}