<p align="center">
<img src="public/stralar-logo.svg" align="center" height="100" />
</p>
<p align="center">
  <strong>Starter built on <a href="https://nextjs.org" target="_blank">Next.js</a></strong> 🤘<br />
  <strong>Commerce backend powered by <a href="https://commercejs.com/" target="_blank">Commerce.js</a></strong> 🛍️<br />
  <strong>Headless CMS powered by <a href="https://sanity.io" target="_blank">Sanity.io</a></strong> ⚡<br />
</p>

<p align="center">
    <a href="#-features">Features</a> •
    <a href="#-set-up">Set up</a> •
    <a href="#-spin-up">Spin up</a> •
    <a href="#-deployment">Deployment</a> •
    <a href="#-extrastips">Extras</a>
</p>
<br />

## What is Commerce.js?

Commerce.js is a headless API-first commerce infrastructure for ultimate eCommerce control giving developers and businesses the freedom to innovate and grow. Built for modern commerce development, you can create custom product, cart, and checkout models with our lightweight, flexible, and extensible APIs.

# ✨ Features

- Utility-first CSS with [Tailwind CSS](https://tailwindcss.com)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Dynamic Page Routes for custom page creation
- Live preview content directly from Sanity
- Modern image component using Sanity's Hotspot, Crop, and automatic WEBP format
- Modular page content for all pages, including dynamic grid layouts
- SEO features:
   - Page-level SEO/Share settings with previews
   - Fallback global SEO/Share settings

<br />

## Commerce.js features

- Products and categories sync into Sanity studio using Chec webhooks
- Product display pages with product information
- Dynamic `/shop` category page with product grid

# Getting started

## Prerequisites

- A [Sanity account](https://www.sanity.io/)
- A Sanity project created using the [Sanity CLI](https://www.sanity.io/docs/getting-started-with-sanity-cli)
- [Chec webhooks](https://dashboard.chec.io/settings/webhooks/add) for syncing products and categories
- [Products](https://dashboard.chec.io/products/add) and [categories](https://dashboard.chec.io/categories/add) uploaded into the Chec dashboard

## ⚙️ Manual set up

Clone this repository from your GitHub account with the [Use this
template](https://github.com/chec/sanity-template-commercejs/generate) button.

### 1) Sanity
1. If you don't have the [Sanity CLI](https://www.sanity.io/docs/getting-started-with-sanity-cli) installed, first run
   `npm install -g @sanity/cli` to install it globally
2. `npm install && sanity init` in the `/studio` folder
3. During Sanity's initalization it will warn you, type `Y` and hit `enter`:
```
? The current folder contains a configured Sanity studio. Would you like to reconfigure it? (Y/n)
```
4. When it asks you what dataset configuration to use, go with the `default`
5. Add CORS Origins to your newly created Sanity project (visit: [manage.sanity.io](https://manage.sanity.io) and go to
   Settings > API):
  - Add your Studio URLs **_with_** credentials: `http://localhost:3333` and `[subdomain].sanity.studio`
  - Add your front-end URLs **_without_** credentials: `http://localhost:3000` and `https://[subdomain].vercel.app`

> ⚠️ **Important!** <br />For "singleton" documents, like settings sections, the schema uses a combination of
> `__experimental_actions` and the new [actions resolver](https://www.sanity.io/docs/document-actions). If you are using
> this outside of the official Sanity Starter, you will need to comment out the `__experimental_actions` line in
> "singleton" schemas to publish settings for the first time. This is because a singleton is still a document type, and
> one needs to exist first before it can be edited. Additionally, if you want to create additional "singleton" schemas,
> be sure to edit the `singletons` array in the following file: `/studio/parts/resolve-actions.js`.

### 2) Chec webhooks

In order for the products and categories to sync into Sanity, you will need to set up the neccessary webhooks for the
products and categories endpoints in your Chec merchant account.

Go to the [developer webhooks page and add the following webhooks](https://dashboard.chec.io/settings/webhooks/add):

1. **Products**:
  - Add the events `products.create`, `products.update`, `products.delete`
  - Enter in the your Vercel URL (see note below) - `https://[subdomain].vercel.app/api/commerce/product-update`
  - Make note of the signing key as you will need this into the environment variables in the below [Next.js set up steps](#3-nextjs)

![Products add webhook details](https://i.ibb.co/HqR7ZTr/products-webhooks.png)

<p align="center">
<img src="https://i.ibb.co/HqR7ZTr/products-webhooks.png" alt="Products add webhook details" align="center" />
</p>

2. Categories:
  - Add the events `categories.create`, `categories.update`, `categories.delete`
  - Enter in the your Vercel URL (see note below) - `https://[subdomain].vercel.app/api/commerce/category-update`
  - Make note of the signing key as you will need this into the environment variables in the below [Next.js set up steps](#3-nextjs)

<p align="center">
<img src="https://i.ibb.co/1ZTsZJk/categories-webhooks.png" alt="Categories add webhook details" align="center" />
</p>

Once you have added the webhooks for both products and categories and save them, you should see the following in your
[webhooks list view](https://dashboard.chec.io/settings/webhooks).

<p align="center">
<img src="https://i.ibb.co/wwWv9Jr/webhooks-list.png" alt="Webhooks list view" align="center" />
</p>

> ⚠️ **Note** <br />You have to use a real domain name (no localhost). Be sure to use your Vercel project URL during
> development, and then switch to the production domain once live. You may not know your Vercel project URL until you
> deploy, feel free to enter something temporary, but make sure to update this once deployed!

### 2) Chec products and categories

This starter template relies on the syncing of products and categories from Chec in order for the products and
categories data to be populated in Sanity studio (read-only) and for the products and categories to be displayed on the
storefront.

1. Start adding categories with the minimum required category fields:
  - Name
  - Permalink

2. Start adding products with the minimum required product fields:
  - Name
  - SKU
  - Description
  - Price
  - Variants - at least one group with one option
  - Custom permalink (in the SEO section at the bottom of the product page)
  - Categories - assign the product to one or more categories

### 3) NextJS
1. `npm install` in the project root folder on local
2. Create an `.env.local` file in the project folder, and add the following variables:
```
# Sanity project environment variables
SANITY_PROJECT_DATASET=production
SANITY_PROJECT_ID=XXXXXX
SANITY_API_TOKEN=XXXXXX

# Chec/Commerce.js environment variables
NEXT_PUBLIC_CHEC_PUBLIC_KEY=XXXXXX
CHEC_API_URL=api.chec.io
CHEC_WEBHOOK_SIGNING_KEY=XXXXXX

// Needed for Klaviyo forms):
KLAVIYO_API_KEY=XXXXXX

// Needed for Mailchimp forms:
MAILCHIMP_API_KEY=XXXXXX-usX
MAILCHIMP_SERVER=usX

// Needed for SendGrid forms:
SENDGRID_API_KEY=XXXXXX
```
3. Update all the `XXXXXX` values, here's where to find each:
  - `SANITY_PROJECT_ID` - You can grab this after you've initalized Sanity, either from the `studio/sanity.json` file,
    or from your Sanity Manage dashboard
  - `SANITY_API_TOKEN` - Generate an API token for your Sanity project. Access your project from the Sanity Manage
    dashboard, and navigate to: "Settings" -> "API" -> "Add New Token" button. Make sure you give `read + write` access!
  - `NEXT_PUBLIC_CHEC_PUBLIC_KEY` - You can grab this from your Chec merchant account, under "Developer" -> "API keys &
    CORS". _(Note: Use the public sandbox key for testing and when you're ready to go live, switch to the public live
    key)_
  - `KLAVIYO_API_KEY` - Create a Private API Key from your Klaviyo Account "Settings" -> "API Keys"
  - `MAILCHIMP_API_KEY` - Create an API key from "Account -> "Extras" -> API Keys
  - `MAILCHIMP_SERVER` - This is the server your account is from. It's in the URL when logged in and at the end of your
    API Key
  - `SENDGRID_API_KEY` - Create an API key from "Settings" -> "API Keys" with "Restricted Access" to only "Mail Send"

<br />

# ⚡ Spin Up
### Sanity (Back End)
`sanity start` in the `/studio` folder to start the studio locally
   - Your Sanity Studio should be running on [http://localhost:3333](http://localhost:3333)

Once you have added your products and categories in the Chec Dashboard and save them, you should expect to see all your products and categories listed under the shop tab and the data populated in the Sanity Studio fields.

<p align="center">
<img src="https://cdn.chec.io/chec-assets/integrations/sanity/screenshot.png" alt="Products listed in Sanity Studio" align="center" />
</p>

### Next (Front End)
`npm run dev` in the project folder to start the front end locally
   - Your front end should be running on [http://localhost:3000](http://localhost:3000)

You will need to [build out the rest of the product modules](#-extrastips) to see the displayed data in the front-end. Once you’ve done that, you should be able to see your product display pages rendered like so:

<p align="center">
<img src="https://cdn.chec.io/chec-assets/integrations/sanity/screenshot-2.png"
    alt="Products display page in Next.js front-end" align="center" />
</p>

<br />

# 🚀 Deployment

### Vercel
This is setup to work seamlessly with Vercel, which I highly recommend as your hosting provider of choice. Simply follow
the on-screen instructions to setup your new project, and be sure to **add the same `.env.local` variables to your
Vercel Project**

### Sanity
This is an easy one, you can simply run `sanity deploy` from the `/studio` folder in your project. Select a subdomain
you want; your Studio is now accessible from the web. This is where I'll invite the client to manage the project so they
can both add billing info and begin editing content.

### Client Updates
Once you hand off to the client you'll want to give them the ability to generate builds when they make updates within
the Sanity Studio. The easiest way to do this is through this [Vercel Deploy
plugin](https://github.com/ndimatteo/sanity-plugin-vercel-deploy).

<br />

# 🤘 Extras/Tips

<details>
<summary><strong>How are my Commerce products synced to Sanity?</strong></summary>

Products get synced into Sanity through the following sequence:
1. The products and categories webhooks are triggered in your Chec merchant from a product or category being created or updated.
2. If the [webhooks are setup correctly](#2-chec-webhooks), it will send the product and category payloads to the API endpoints
   `/api/commerce/product-update` and `/api/commerce/category-update` respectively.
3. The sync function at your API endpoint will then update the product and category in Sanity.

**Note**: You must have the webhook notifications setup to a live URL and not localhost. All Chec ENV variables must
also be added to the live hosting environment (e.g. Vercel).
</details>

<details>
<summary><strong>Is this a starter template?</strong></summary>

This template is a starter that was bootstrapped off of the [HULL template](https://github.com/ndimatteo/HULL), injected with Commerce.js products and categories data. While this version of the project only contains the pre-checkout data from Commerce.js, it is a great starting point for you to include the already integrated cart actions and build out a checkout form.

The rest of the front end is rather opinionated and includes all the components you would need to flesh out additional pages, modules, and features. The decision that went into making this template (referenced from HULL author) was to achieve these goals:

1. Use high-quality packages that don't get in the way
2. Solve common UX problems and complex logic so you can focus on the fun stuff
3. Create a more approachable starter for anyone looking to build headless experiences with a CMS and commerce backend

Extracted component classes have been created not only for cleaner file structure, but also so you can easily work
in your own styles exclusively within the styles folder. Feel free to extend or outright remove the applied styles for
all of the components.
</details>

<details>
<summary><strong>How do I build out my front end using the Sanity studio?</strong></summary>

This starter template is injected with a lot of features for front end display, you will just need to add the modules you
need in your Sanity studio. Once you have your studio spun up, you can start by going under:
  - The Pages tab to create the 'Home Page', 'Shop All Page', 'Error Page', and 'Other Pages'.
  - The Shop tab to fill in the Sanity content fields such as Gallery, Product Card, and other additional page modules.
    The same goes for the Categories tab.

  **Note**: Naturally, nothing will show up on the storefront until you add modules, grid, and input fields to the page.
</details>

<details>
<summary><strong>What are extracted component classes and why should I use them?</strong></summary>

While utility-first CSS definitely speeds up your dev time, it can become overwhelming and untenable. This can make it
difficult to understand what a component is doing when shrouded in dozens of utility classes, especially for developers
getting familiar with a new codebase. Luckily, Tailwind offers the ability to [extract a
component](https://tailwindcss.com/docs/extracting-components), allowing you to compose custom utility patterns.

The nice thing about this is we can get all the benefits of writing in utility class shorthand, but without having to
sift through all your javascript logic to adjust styles. This means writing our CSS is business as usual. You create
stylesheets, but use Tailwind's `@apply` to create nice and succinct classes to push to your components.

You still get all the tree-shaking benefits of Tailwind, _and_ you can still use utility classes in your components when
needed; the best of both worlds!
</details>

<details>
<summary><strong>Error: Failed to communicate with the Sanity API</strong></summary>

If you get this error in your CLI, you need to logout and log back in again. Simply do `sanity logout` and then `sanity
login` to fix.
</details>

<details>
<summary><strong>How do I properly hand-off a Vercel project to the client?</strong></summary>

1. Have the client create their own [Vercel account](https://vercel.com/signup)
2. At the time of writing, Github connections can only be connected to one Vercel account at a time, so have the client
   [create a Github account](https://github.com/join) if they don't already have one, and transfer the project repo to
   them
3. Delete the dev project from your own Vercel account (this is so the client can utilize the project name and domain
   you were using during dev)
4. You or the client can now connect their newly transferred Github repo to their own Vercel account!
   </details>

<details>
<summary><strong>How can I see the bundle size of my website?</strong></summary>

Simply run `npm run analyze` from the project folder. This will run a build of your site and automatically open the
[Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) visuals for your site's build
files.
</details>

<br />

# 💯 Credits
This template was bootstrapped from the HULL project built by [@ndimatteo](https://github.com/ndimatteo)

<br />
