import sanityClient from '@sanity/client';
import { nanoid } from 'nanoid';
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
    console.error('Must be a POST or PUT request with a product ID');
    return res.status(400).json({
      method: req.method,
      error: 'Must be a POST or PUT request with a product ID',
    });
  }

  // Convert request stream into a readable JSON body
  const buffers = [];
  for await (const chunk of req) {
      buffers.push(chunk);
  }
  req.body = JSON.parse(Buffer.concat(buffers).toString());

  // Check that the handled events are supported
  if (!['products.create', 'products.update', 'products.delete', 'test.webhook'].includes(req.body.event)) {
    return res.status(422).json({
      method: req.method,
      error: 'The provided webhook event is not supported.',
    });
  }

  try {
    // Call the Chec webhook verifier helper to verify webhook authenticity
    verifyWebhook(req.body, signingKey);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return res.status(500).json({
      error: 'Failed to verify webhook signature in payload.',
    });
  }

  // Handle test webhook events
  if (req.body.event === 'test.webhook') {
    return res.status(200).json({
      message: 'Test webhook event received!',
    });
  }

  console.log('Webhook payload:', req.body);

  // Initiate Sanity transaction to perform the following chained mutations
  let sanityTransaction = sanity.transaction()

  // Handle deleted products from Chec/Commerce.js
  if (req.body.event === 'products.delete' && req.body.model_ids?.length > 0) {
    sanityTransaction.delete(`product-${req.body.model_ids[0]}`);
    const result = await sanityTransaction.commit();

    console.info('Sync complete, product deleted!');
    return res.status(200).json(result);
  }

  // Handle products being created or updated
  // Extract the Commerce data from the webhook payload. The payloads are product responses.
  const { body: { payload: {
    id,
    name,
    description,
    // Extract formatted_with_symbol price from the price object as we don't need
    // the other price fields.
    price: { formatted_with_symbol: price },
    active,
    variant_groups: variantGroups,
    permalink,
    inventory,
    sku,
  } } } = req;

  /*  ------------------------------ */
  /*  Construct our product objects
  /*  ------------------------------ */

  // Define product objects
  const modelId = `product-${id}`;
  const product = {
    _type: 'product',
    _id: modelId,
  }

  // Define product options if there is more than one variant group
  const productOptions =
    variantGroups?.length > 1
      ? variantGroups.map((group) => ({
        _key: group.id,
        _type: 'productOption',
        name: group.name,
        values: group.options.map((option) => option.name),
      }
  )) : [];

  // Define product fields
  const productFields = {
    wasDeleted: false,
    isActive: active,
    productName: name,
    productID: id,
    price: price,
    description: description || '',
    slug: permalink,
    // price: variants[0].price * 100,
    sku: sku,
    inStock: (inventory?.managed && inventory.available > 0) || true,
    lowStock: (inventory?.managed && inventory.available <= 4) || false,
    values: productOptions,
  };

  /*  ------------------------------ */
  /*  Begin Sanity Product Sync
  /*  ------------------------------ */

  console.log('Writing product to Sanity...')

  // Run chain mutations to write product to Sanity

  // Create product if doesn't exist
  sanityTransaction = sanityTransaction.createIfNotExists(product)

  // Unset options field first, to avoid patch set issues
  sanityTransaction = sanityTransaction.patch(modelId, (patch) => patch.unset(['productOptions']))

  // Patch (update) product document with core commerce data
  sanityTransaction = sanityTransaction.patch(modelId, (patch) => patch.set(productFields))

  // Patch (update) title & slug if none has been set
  sanityTransaction = sanityTransaction.patch(modelId, (patch) =>
    patch.setIfMissing({ title: name })
  )

  // patch (update) productHero module if none has been set
  sanityTransaction = sanityTransaction.patch(modelId, (patch) =>
    patch.setIfMissing({
      modules: [
        {
          _key: nanoid(),
          _type: 'productHero',
          active: true,
        },
      ],
    })
  )

  const result = await sanityTransaction.commit();

  console.info('Sync complete!');
  console.log('Result', result);

  res.statusCode = 200;
  res.json(JSON.stringify(result));
}
