import sanityClient from '@sanity/client';
import { nanoid } from 'nanoid';
const { verifyWebhook } = require('@chec/webhook-verifier');

const sanity = sanityClient({
  dataset: process.env.SANITY_PROJECT_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2021-03-25',
  useCdn: false,
});

// Turn off defautl NextJS bodyParser to run own middleware
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function send(req, res) {
  // Chec if the request is a POST request
  if (req.method !== 'POST') {
    console.error('Must be a POST request with a product ID');
    return res.status(200).json({
      error: 'Must be a POST request with a product ID',
    });
  }

  // Call the Chec webhook verifier to verify webhook authenticity
  verifyWebhook(req.body, process.env.CHEC_WEBHOOK_SIGNING_KEY);

  // If it's a readiness probe, return a 204
  if (req.body.event === 'readiness_probe') {
    return {
      statusCode: 204,
      body: '',
    }
  }

  // Extract the Commerce data
  const { body: {
    id,
    name,
    active,
    variant_groups,
    permalink,
    inventory
  } } = req;

  console.info(`Sync triggered for product: ${name} (id: ${id})`);

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
    variant_groups.length > 1
      ? variant_groups.map((option) => ({
        _key: option.id,
        _type: 'productOption',
        name: option.name,
      }
    )) : [];

  // Define product fields
  const productFields = {
    wasDeleted: false,
    isDraft: !active,
    productTitle: name,
    productID: id,
    slug: { current: permalink },
    // price: variants[0].price * 100,
    // sku: variants[0].sku || '',
    inStock: (inventory.managed && inventory.available > 0) || true,
    lowStock: (inventory.managed && inventory.available <= 4) || false,
    options: productOptions,
  };

  // // Define productVariant documents
  // const productVariants = variants
  //   .sort((a, b) => (a.id > b.id ? 1 : -1))
  //   .map((variant) => ({
  //     _type: 'productVariant',
  //     _id: `productVariant-${variant.id}`,
  //   }))

  // Define productVariant fields
  // const productVariantFields = variants
  //   .sort((a, b) => (a.id > b.id ? 1 : -1))
  //   .map((variant) => ({
  //     isDraft: status === 'draft' ? true : false,
  //     wasDeleted: false,
  //     productTitle: title,
  //     productID: id,
  //     variantTitle: variant.title,
  //     variantID: variant.id,
  //     price: variant.price * 100,
  //     comparePrice: variant.compare_at_price * 100,
  //     sku: variant.sku || '',
  //     inStock:
  //       variant.inventory_quantity > 0 ||
  //       variant.inventory_policy === 'continue',
  //     lowStock: variant.inventory_quantity <= 5,
  //     options:
  //       variants.length > 1
  //         ? options.map((option) => ({
  //             _key: option.id,
  //             _type: 'productOptionValue',
  //             name: option.name,
  //             value: variant[`option${option.position}`],
  //             position: option.position,
  //           }))
  //         : [],
  //   }))


  /*  ------------------------------ */
  /*  Check for previous sync
  /*  ------------------------------ */

  console.log('Checking for previous sync data...')

  // Setup our Shopify connection
  const shopifyConfig = {
    'Content-Type': 'application/json',
    'X-Authorization': process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY,
  }

  /*  ------------------------------ */
  /*  Begin Sanity Product Sync
  /*  ------------------------------ */

  console.log('Writing product to Sanity...')
  let stx = sanity.transaction()

  // create product if doesn't exist
  stx = stx.createIfNotExists(product)

  // unset options field first, to avoid patch set issues
  stx = stx.patch(`product-${id}`, (patch) => patch.unset(['options']))

  // patch (update) product document with core shopify data
  stx = stx.patch(`product-${id}`, (patch) => patch.set(productFields))

  // patch (update) title & slug if none has been set
  stx = stx.patch(`product-${id}`, (patch) =>
    patch.setIfMissing({ title: name })
  )

  // patch (update) productHero module if none has been set
  stx = stx.patch(`product-${id}`, (patch) =>
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
  // productVariants.forEach((variant, i) => {
  //   stx = stx.createIfNotExists(variant)
  //   stx = stx.patch(variant._id, (patch) => patch.set(productVariantFields[i]))
  //   stx = stx.patch(variant._id, (patch) =>
  //     patch.setIfMissing({ title: productVariantFields[i].variantTitle })
  //   )
  // })

  // // grab current variants
  // const currentVariants = await sanity.fetch(
  //   `*[_type == "productVariant" && productID == ${id}]{
  //     _id
  //   }`
  // )

  // // mark deleted variants
  // currentVariants.forEach((cv) => {
  //   const active = productVariants.some((v) => v._id === cv._id)
  //   if (!active) {
  //     stx = stx.patch(cv._id, (patch) => patch.set({ wasDeleted: true }))
  //   }
  // })

  const result = await stx.commit()

  console.info('Sync complete!')
  console.log(result)

  res.statusCode = 200
  res.json(JSON.stringify(result))
}