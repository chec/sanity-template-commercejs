import sanityClient from '@sanity/client';
import { nanoid } from 'nanoid';

const { verifyWebhook } = require('@chec/webhook-verifier');

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
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
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

  try {
    // Call the Chec webhook verifier helper to verify webhook authenticity
    verifyWebhook(req.body, signingKey);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return res.status(500).json({
      error: 'Failed to verify webhook signature in payload.',
    });
  }

  console.log('Webhook payload:', req.body);
  // console.log('Payload variant groups:', req.body.payload.variant_groups?.map((group) => group.options));

  // Initiate Sanity transaction to perform the following chained mutations
  let sanityTransaction = sanity.transaction()

  // Handle deleted products from Chec/Commerce.js
  if (req.body.event === 'products.delete' && req.body.model_ids?.length > 0) {
    sanityTransaction.delete(`product-${req.body.model_ids[0]}`);
    const result = await sanityTransaction.commit();

    console.info('Sync complete, product deleted!');
    console.log('Result', result);

    res.statusCode = 200;
    res.json(JSON.stringify(result));
    return;
  }

  // Handle variants create or update
  // if (req.body.event === 'variants.create' || req.body.event === 'variants.update') {
  //   const result = await sanityTransaction.commit();

  //   console.info('Sync complete, variants updated');
  //   console.log('Result', result);

  //   res.statusCode = 200;
  //   res.json(JSON.stringify(result))

  //   return;
  // }

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
  const product = {
    _type: 'product',
    _id: `product-${id}`,
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
    description: description,
    slug: permalink,
    // price: variants[0].price * 100,
    sku: sku,
    inStock: (inventory?.managed && inventory.available > 0) || true,
    lowStock: (inventory?.managed && inventory.available <= 4) || false,
    values: productOptions,
  };

  // Define productVariant documents
  const productVariants = variants
    .sort((a, b) => (a.id > b.id ? 1 : -1))
    .map((variant) => ({
      _type: 'productVariant',
      _id: `productVariant-${variant.id}`,
    }))

  // Define productVariant fields
  const productVariantFields = variants
    .sort((a, b) => (a.id > b.id ? 1 : -1))
    .map((variant) => ({
      isActive: status === 'active' ? true : false,
      wasDeleted: false,
      productName: title,
      productID: id,
      variantName: variant.title,
      variantID: variant.id,
      price: variant.price * 100,
      comparePrice: variant.compare_at_price * 100,
      sku: variant.sku || '',
      inStock:
        variant.inventory_quantity > 0 ||
        variant.inventory_policy === 'continue',
      lowStock: variant.inventory_quantity <= 5,
      options:
        variants.length > 1
          ? options.map((option) => ({
              _key: option.id,
              _type: 'productOptionValue',
              name: option.name,
              value: variant[`option${option.position}`],
              position: option.position,
            }))
          : [],
    }))


  /*  ------------------------------ */
  /*  Begin Sanity Product Sync
  /*  ------------------------------ */

  console.log('Writing product to Sanity...')

  // Run chain mutations to write product to Sanity

  // Create product if doesn't exist
  sanityTransaction = sanityTransaction.createIfNotExists(product)

  // Unset options field first, to avoid patch set issues
  sanityTransaction = sanityTransaction.patch(`product-${id}`, (patch) => patch.unset(['productOptions']))

  // Patch (update) product document with core commerce data
  sanityTransaction = sanityTransaction.patch(`product-${id}`, (patch) => patch.set(productFields))

  // Patch (update) title & slug if none has been set
  sanityTransaction = sanityTransaction.patch(`product-${id}`, (patch) =>
    patch.setIfMissing({ title: name })
  )

  // patch (update) productHero module if none has been set
  sanityTransaction = sanityTransaction.patch(`product-${id}`, (patch) =>
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

  // create variant if doesn't exist & patch (update) variant with core shopify data
  productVariants.forEach((variant, i) => {
    sanityTransaction = sanityTransaction.createIfNotExists(variant)
    sanityTransaction = sanityTransaction.patch(variant._id, (patch) => patch.set(productVariantFields[i]))
    sanityTransaction = sanityTransaction.patch(variant._id, (patch) =>
      patch.setIfMissing({ title: productVariantFields[i].variantTitle })
    )
  })

  // // grab current variants
  const currentVariants = await sanity.fetch(
    `*[_type == "productVariant" && productID == ${id}]{
      _id
    }`
  )

  // mark deleted variants
  currentVariants.forEach((cv) => {
    const active = productVariants.some((v) => v._id === cv._id)
    if (!active) {
      sanityTransaction = sanityTransaction.patch(cv._id, (patch) => patch.set({ wasDeleted: true }))
    }
  })

  const result = await sanityTransaction.commit();

  console.info('Sync complete!');
  console.log('Result', result);

  res.statusCode = 200;
  res.json(JSON.stringify(result));
}
