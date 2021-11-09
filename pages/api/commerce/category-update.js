import sanityClient from '@sanity/client';
import { verifyWebhook } from '@chec/webhook-verifier';

// Initialize Sanity client
const sanity = sanityClient({
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-11-08',
  useCdn: false,
});

// Turn off default NextJS bodyParser, so we can run our own middleware
export const config = {
  api: {
    bodyParser: false,
  },
};

// Chec webhook signing key from the Chec Dashboard webhooks setting page
const signingKey = process.env.CHEC_WEBHOOK_SIGNING_KEY;

export default async function send(req, res) {
  // Check if the request is a POST, PUT, DELETE request
  // These are coming from the registered events in the webhook
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(400).json({
      method: req.method,
      error: 'Must be a POST or PUT request with a category ID',
    });
  }

  // Convert request stream into a readable JSON body
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  req.body = JSON.parse(Buffer.concat(buffers).toString());

  try {
    // Call the Chec webhook verifier helper to verify webhook authenticity
    verifyWebhook(req.body, signingKey);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to verify webhook signature in payload.',
    });
  }

  // Initiate Sanity transaction to perform the following chained mutations
  let sanityTransaction = sanity.transaction()

  // Handle deleted categories from Chec/Commerce.js
  if (req.body.event === 'categories.delete' && req.body.model_ids?.length > 0) {
    sanityTransaction.delete(`category-${req.body.model_ids[0]}`);
    const result = await sanityTransaction.commit();

    console.info('Sync complete, category deleted!');
    console.log('Result', result);

    res.statusCode = 200;
    res.json(JSON.stringify(result));
    return;
  }

  // Handle categories being created or updated
  // Extract the Commerce data from the webhook payload. The payloads are product responses.
  const { body: { payload: {
    id,
    name,
    description,
    slug,
  } } } = req;

  /*  ------------------------------ */
  /*  Construct our product objects
  /*  ------------------------------ */

  // Define category objects
  const modelId = `category-${id}`;
  const category = {
    _type: 'category',
    _id: modelId,
  }

  // Define category fields
  const categoryFields = {
    title: name,
    categoryID: id,
    slug,
    description,
  };

  /*  ------------------------------ */
  /*  Begin Sanity category sync
  /*  ------------------------------ */

  console.log('Writing category to Sanity...')

  // Run chain mutations to write product to Sanity

  // Create category if doesn't exist
  sanityTransaction = sanityTransaction.createIfNotExists(category)

  // Patch (update) category document with core commerce data
  sanityTransaction = sanityTransaction.patch(modelId, (patch) => patch.set(categoryFields))

  // Patch (update) title & slug if none has been set
  sanityTransaction = sanityTransaction.patch(modelId, (patch) =>
    patch.setIfMissing({ title: name })
  )

  const result = await sanityTransaction.commit();

  console.info('Sync complete!');
  console.log('Result', result);

  res.statusCode = 200;
  res.json(JSON.stringify(result));
}
