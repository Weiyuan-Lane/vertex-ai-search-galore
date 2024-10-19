const { FunctionDeclarationSchemaType } = require('@google-cloud/vertexai');
const axios = require('axios');

const getExchangeRateFunctionDeclaration = {
  name: 'get_exchange_rate',
  description: 'Get the exchange rate from one currency to another currency',
  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
      currency_from: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'The currency to convert from'
      },
      currency_to: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'The currency to convert to'
      },
    },
    required: ['currency_from', 'currency_to'],
  },
};

async function getExchangeRate(currencyFrom, currencyTo) {
  try {
    const response = await axios.get('https://api.frankfurter.app/latest', {
      params: {
        base: currencyFrom,
        symbols: currencyTo
      }
    });

    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

module.exports = {
  getExchangeRateFunctionDeclaration,
  getExchangeRate,
};
