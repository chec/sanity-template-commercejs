import { getSanityClient } from '@lib/sanity'
import * as queries from './queries'

// Fetch all dynamic docs
export async function getAllDocSlugs(doc) {
  const data = await getSanityClient().fetch(
    `*[_type == "${doc}" && !(_id in [${queries.homeID}, ${queries.shopID}, ${queries.errorID}]) && wasDeleted != true && isDraft != true]{ "slug": slug.current }`
  )
  return data
}

// Fetch all our page redirects
export async function getAllRedirects() {
  const data = await getSanityClient().fetch(
    `*[_type == "redirect"]{ from, to }`
  )
  return data
}

// Fetch a static page with our global data
export async function getStaticPage(pageData, preview) {
  const query = `
  {
    "page": ${pageData},
    ${queries.site}
  }
  `
  debugger;
  const data = await getSanityClient(preview).fetch(query);

  return data;
}

// Fetch a specific dynamic page with our global data
export async function getPage(slug, preview) {
  const slugs = [`/${slug}`, slug, `/${slug}/`]

  const query = `
    {
      "page": *[_type == "page" && slug.current in ${JSON.stringify(
        slugs
      )}] | order(_updatedAt desc)[0]{
        hasTransparentHeader,
        modules[]{
          ${queries.modules}
        },
        title,
        seo
      },
      ${queries.site}
    }
    `

  const data = await getSanityClient(preview).fetch(query)

  return data
}

/**
 * Fetch a single product by its slug with our global data
 * @
 * @param {string} slug 
 * @param {*} preview 
 * @returns {object}
 */
 export async function getProduct(slug, preview) {
  // Set up the query for getting a product
  const query = `
    {
      "product": *[_type == "product" && slug.current == "${slug}"] {
        hasTransparentHeader,
        modules[] {
          ${queries.modules}
        },
        "product": ${queries.product},
        title,
        seo
      },
      ${queries.site}
    }
  `

  const data = await getSanityClient(preview).fetch(query);

  return data;
}

/**
 * Fetch a specific collection with our global data
 * 
 * @param {string} slug
 * @param {*} preview
 * @returns {object}
 */
export async function getCollection(slug, preview) {
  // Set up the query for getting a collection
  const query = `
    {
      "page": *[_type == "collection" && slug.current == "${slug}"] {
      hasTransparentHeader,
      modules[] {
        ${queries.modules}
      },
      "collection": ${queries.collection},
      title,
      seo
    },
    ${queries.site}
  `

  const data = await getSanityClient(preview).fetch(query);

  return data;
}

export { queries }
