import Commerce from '@chec/commerce.js';
import { isBrowser } from '@lib/helpers';

// First, check that Chec variables are set
const checApiKey = process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY;
const devEnvironment = process.env.NODE_ENV === 'development';

// Warn the client if variables are missing
if (!checApiKey && isBrowser) {
  console.warn('Chec/Commerce.js .env variables are missing. Obtain your Chec public key by logging into your Chec account and navigate to Setup > Developer, or can be obtained with the Chec CLI via with the command chec whoami.');
}

// Provide Commerce configuration options
const commerceConfig = {
  axiosConfig: {
    headers: {
      'X-Chec-Agent': 'commerce.js/v2',
      'Chec-Version': '2021-10-06',
    },
  },
  allowSecretKey: true,
};

// Otherwise, setup the client and export
export default checApiKey ? new Commerce(
  checApiKey,
  devEnvironment,
  commerceConfig,
) : null;
