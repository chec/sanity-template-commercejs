
import commerce from '@lib/commerce';
import axios from 'axios';

export default async function send(req, res) {
  const { query: { id } } = req;

  const hasCommerce = process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY;

  // Return error if product id is not provided
  if (!id) {
    return res.status(401).json({
      error: 'Product ID is required',
    })
  }

  // Return error if Commerce API key is not provided
  if (!hasCommerce) {
    return res.status(401).json({
      error: 'Commerce API is not enabled',
    })
  }

  const commerceConfig = {
    'Content-Type': 'application/json',
    'X-Authorization': process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY,
  };

  // Get product from Commerce
  const commerceProduct = await axios({
    url: `https://${process.env.CHEC_API_URL}/v1/products/${id}`,
    method: 'GET',
    headers: commerceConfig,
  }).then ((response) => {
    debugger;
    return response.data;
  }).catch(() => null );

  // Return error if Commerce can't find product
  if (!commerceProduct) {
    return res.status(401).json({
      error: 'Product not found',
    })
  }

  res.statusCode = 200;
  res.json(product);
}