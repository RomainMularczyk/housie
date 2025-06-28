import type { ConstructorParams } from '@browserbasehq/stagehand';
import dotenv from 'dotenv';

dotenv.config();

const StagehandConfig: ConstructorParams = {
  verbose: 1 /* Verbosity level for logging: 0 = silent, 1 = info, 2 = all */,
  domSettleTimeoutMs: 30_000 /* Timeout for DOM to settle in milliseconds */,

  // LLM configuration
  modelName: 'gpt-4o' /* Name of the model to use */,
  modelClientOptions: {
    apiKey: process.env.OPENAI_API_KEY,
  } /* Configuration options for the model client */,

  // Browser configuration
  env: 'LOCAL' /* Environment to run in: LOCAL or BROWSERBASE */,
  apiKey: process.env.BROWSERBASE_API_KEY /* API key for authentication */,
  projectId: process.env.BROWSERBASE_PROJECT_ID /* Project identifier */,
  browserbaseSessionID: undefined /* Session ID for resuming Browserbase sessions */,
  browserbaseSessionCreateParams: {
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      blockAds: true,
      viewport: {
        width: 1280,
        height: 1024,
      },
    },
  },
  localBrowserLaunchOptions: {
    viewport: {
      width: 1280,
      height: 1024,
    },
    headless: true,
    extraHTTPHeaders: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) '
        + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    }
  } /* Configuration options for the local browser */,
};

export default StagehandConfig;
