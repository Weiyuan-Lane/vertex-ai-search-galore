const {VertexAI} = require('@google-cloud/vertexai');
const env = require('./config/env');
const path = require('path');
const marked = require('marked');
const cors = require('cors');

// Init express for this node server
const express = require('express');
const app = express();
app.use(express.json());
// Enable origin for angular in local environment
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: 'http://localhost:4200' }));
}

// HTML Content
app.use(express.static(path.join(__dirname, '../dist/chat-with-gemini/browser')));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../dist/chat-with-gemini/browser/index.html'));
});

const port = env.PORT;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/*****************************************************************************
 * All Vertex AI related code will be added below this comment block         *
 *****************************************************************************/

const {
  googleMerchStoreSearchDeclaration,
  googleMerchStoreSearch,
} = require('./gemini_functions/vertexai_google_merch_store_search');
const {
  getExchangeRateFunctionDeclaration,
  getExchangeRate,
} = require('./gemini_functions/exchange_rate');
const {
  getWikipediaContentFunctionDeclaration,
  getWikipediaContent,
} = require('./gemini_functions/wikipedia');


const INVALID_RESULTS_MESSAGE = 'No results were found';

app.post('/search', async (req, res) => {
  try {
    const query = req.body.message;
    if (!query || query === '') {
      return res.status(400).json({ error: 'Missing message parameter' });
    }

    // // Main post request to the search endpoint *******************************
    const { message, results } = await searchWithNode(query);
    const strippedMessage = message.replace(/\n\s*$/m, '');
    res.status(200).send({
      message: strippedMessage,
      results: results,
    });
    //*************************************************************************

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error'});
  }
});

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: env.GCP_PROJECT_ID,
  location: env.GCP_REGION
});

const searchEngineModel = vertex_ai.getGenerativeModel({
  model: env.GCP_GEMINI_VER,
  systemInstruction: {
    role: 'system',
    parts: [{
      'text': `
        You are a search engine.

        Please return the most relevant search results for the given query.
        If the user tries to chat with you, return the message '${INVALID_RESULTS_MESSAGE}'.
      `,
    }]
  },
  generationConfig: {
    'maxOutputTokens': 2048,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [
    {
        'category': 'HARM_CATEGORY_HATE_SPEECH',
        'threshold': 'BLOCK_NONE'
    },
    {
        'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
        'threshold': 'BLOCK_NONE'
    },
    {
        'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'threshold': 'BLOCK_NONE'
    },
    {
        'category': 'HARM_CATEGORY_HARASSMENT',
        'threshold': 'BLOCK_NONE'
    }
  ],
});

// Implemented search logic with Gemini model
const searchTools = {
  function_declarations: [
    googleMerchStoreSearchDeclaration,
    getExchangeRateFunctionDeclaration,
    getWikipediaContentFunctionDeclaration,
  ],
};

async function searchWithNode(query) {
  // 1. Initial search logic
  const request = {
    contents: [{
      role: 'user',
      parts: [{
        text: query,
      }]
    }],
    tools: [
      searchTools,
    ],
  };

  // 2. Extracting the search results
  const { output, searchResults } = await searchEngineGenerateContent({
    request,
    firstCall: true,
  });

  // 3. Return the search results
  const markedOutput = marked.parse(output);
  return {
    message: markedOutput,
    results: searchResults,
  }
}

function isFunctionCall(candidates) {
  return candidates?.length > 0 &&
    candidates[0]?.content?.parts?.length > 0 &&
    !!(candidates[0].content.parts[0]?.functionCall?.name);
}

async function functionCallLogic(priorRequest, candidates) {
  let output = INVALID_RESULTS_MESSAGE, searchResults = [];
  let request = priorRequest;

  // Single function calling
  if (candidates.length === 1) {
    const functionCallObj = candidates[0].content.parts[0].functionCall;
    const functionCallName = functionCallObj.name;
    const functionCallArgs = functionCallObj.args;
    request.contents.push({
      role: 'model',
      parts: [{ functionCall: functionCallObj }],
    });

    switch (functionCallName) {
      case googleMerchStoreSearchDeclaration.name:
        searchResults = await googleMerchStoreSearch(functionCallArgs.productName, functionCallArgs.productDescription);
        output = `Found ${searchResults.length} results`;
        break;

      case getExchangeRateFunctionDeclaration.name:
        const exchangeRateData = await getExchangeRate(functionCallArgs.currency_from, functionCallArgs.currency_to);
        if (!exchangeRateData) {
          break;
        }

        request.contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: getExchangeRateFunctionDeclaration.name,
                response: {name: getExchangeRateFunctionDeclaration.name, content: exchangeRateData},
              },
            },
          ]
        });
        ({ output, searchResults } = await searchEngineGenerateContent({ request, firstCall: false }));
        break;

      case getWikipediaContentFunctionDeclaration.name:
        const wikiContent = await getWikipediaContent(functionCallArgs.subject);
        if (!wikiContent) {
          break;
        }

        request.contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: getWikipediaContentFunctionDeclaration.name,
                response: {name: getWikipediaContentFunctionDeclaration.name, content: wikiContent},
              },
            },
          ]
        });
        ({ output, searchResults } = await searchEngineGenerateContent({ request, firstCall: false }));


      default:
        break;
    }

  // Disabling parallel function calling for now
  } else if (candidates.length >= 2) {
    searchResults = [];
    output = `Could you ask a more specific question?`;
  }

  return {
    output,
    searchResults,
  }
}

async function searchEngineGenerateContent({ request, firstCall = false }) {
  const modelContent = await searchEngineModel.generateContent(request);
  const response = modelContent.response;
  let output = INVALID_RESULTS_MESSAGE, searchResults = [];

  // Only allow function call for first call - no recursive function calls
  if (firstCall && isFunctionCall(response.candidates)){
    ({ output, searchResults } = await functionCallLogic(request, response.candidates));
  } else {
    output = response?.candidates[0]?.content?.parts[0]?.text || INVALID_RESULTS_MESSAGE;
  }

  return {
    output,
    searchResults,
  };
}
