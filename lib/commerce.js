import CommerceClient from '@chec/commerce.js';
import { isBrowser } from '@lib/helpers';

// First, check that Chec variables are set
const checApiToken = process.env.CHEC_API_TOKEN;

// Warn the client if variables are missing
if (!checApiToken && isBrowser) {
  console.warn('Chec/Commerce.js .env variables are missing. Obtain your Chec public key by logging into your Chec account and navigate to Setup > Developer, or can be obtained with the Chec CLI via with the command chec whoami.');
}

// Otherwise, setup the client and export
export default checApiToken ? new CommerceClient(checApiToken) : null;
