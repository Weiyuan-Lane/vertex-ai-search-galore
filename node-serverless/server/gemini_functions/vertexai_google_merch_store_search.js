const { FunctionDeclarationSchemaType } = require('@google-cloud/vertexai');
const { SearchServiceClient } = require('@google-cloud/discoveryengine').v1beta;
const env = require('../config/env');

// Init SearchServiceClient
const searchClient = new SearchServiceClient({
  apiEndpoint: `${env.GCP_VERTEXAI_SEARCH_LOCATION}-discoveryengine.googleapis.com`,
});
const searchServingConfig = `projects/${env.GOOGLE_CLOUD_PROJECT_NUMBER}/locations/${env.GCP_VERTEXAI_SEARCH_LOCATION}/collections/default_collection/engines/${env.GCP_VERTEXAI_SEARCH_ENGINE_ID}/servingConfigs/default_search:search`

// Function declaration
const googleMerchStoreSearchDeclaration = {
  name: 'google_merch_store_search',
  description:`
    Use this tool to only search for Google Merch Store products.

    Find a product with the productName and productDescription from Google Merch Shop and returns a dictionary containing product details.
  `,
  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
      productName: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'Product name to search for'
      },
      productDescription: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'Product description to search for'
      },
    },
    required: ['productName', 'productDescription'],
  },
};

// Actual function to perform
async function googleMerchStoreSearch(productName, productDescription) {
  const request = {
    pageSize: 10,
    query: `${productName} ${productDescription}`,
    servingConfig: searchServingConfig,
  };

  const response = await searchClient.search(request, {
    autoPaginate: false,
  });

  // Index 2 is search response - See here for more - https://cloud.google.com/generative-ai-app-builder/docs/preview-search-results
  const searchResults = response[2].results;
  const formattedSearchResults = searchResults.map((result) => {
    // You might want to add some type from your datastore results so you don't need to process it here
    return result?.document?.structData?.fields || {};
  }).filter((result) => {
    return Object.keys(result).length > 0
  });

  return formattedSearchResults;
}

module.exports = {
  googleMerchStoreSearchDeclaration,
  googleMerchStoreSearch,
};

