const {VertexAI} = require('@google-cloud/vertexai');
const {
  translateWithFoodContextFunctionDeclaration,
  translateWithFoodContextEmptyResponseCall,
} = require('./gemini_functions/translate');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: 'trygcp-ai-new', location: 'us-central1'});
const proModel = 'gemini-1.0-pro-001';
const flashModel = 'gemini-1.5-flash-001';

const express = require('express');
const marked = require('marked');
const app = express();
app.use(express.json())
const port = 8080;
const path = require('path');


// Chat implementation
app.post('/chat', async (req, res) => {
  try {
    const chatResponse = await sendMessageStream(req.body.message);
    const parsedResponse = marked.parse(chatResponse);
    res.status(200).send({
      message: parsedResponse,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});

// Let's test and play with the following translations
//
//  Tôi ở đây với bánh của bạn, cho tôi vào nhé. - pie/cake
//  Tôi ở đây với banh của bạn, cho tôi vào nhé. - balls
//
//  Alternate
//
//  Tôi đến đây để giao bánh cho bạn - pie/cake
//  Tôi đến đây để giao banh cho bạn - balls
//
//  bạn xuống lấy bánh tôi tới rồi - pie/cake
//  bạn xuống lấy banh tôi tới rồi - balls
//
//  bánh mè - pie/cake
//  banh mè - balls
//
//  giao mì cho bạn
//  giao mi cho ban
//
app.post('/translate-for-food', async (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: 'Missing message parameter' });
  }
  if (!req.body.srcLang) {
    return res.status(400).json({ error: 'Missing srcLang parameter' });
  }
  if (!req.body.destLang) {
    return res.status(400).json({ error: 'Missing destLang parameter' });
  };

  try {
    const jsonResponse = await translateWithFoodContext(req.body.message, req.body.srcLang, req.body.destLang);
    res.status(200).json(jsonResponse);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: proModel,
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

const chat = generativeModel.startChat({});

async function sendMessageStream(message) {
  const result = await chat.sendMessageStream([
    { text: 'Talk like Ryan Reynolds' },
    { text: message }
  ]);
  let output = '';
  for await (const item of result.stream) {
    const text = item.candidates[0].content.parts[0].text;
    output = `${output}${text}`;
  }

  return output;
}

// See a sample here: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/generative-ai/snippets/function-calling/functionCallingBasic.js
async function translateWithFoodContext(message, srcLang, targetLang) {
  const generativeModelWithFunctionCalling = vertex_ai.preview.getGenerativeModel({
    model: proModel,
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

  const result = await generativeModelWithFunctionCalling.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{
          text: `Translate this message "${message}", from "${srcLang}" to "${targetLang}", and return the translated text.`,
        }, {
          text: 'You are a delivery driver delivering all kinds of food. Please correct typos if there are before translating'
        }]
      },
    ],
    tools: [
      {
        function_declarations: [translateWithFoodContextFunctionDeclaration],
      }
    ],
    tool_config: {
      function_calling_config: {
        mode: 'ANY',
        allowed_function_names: [translateWithFoodContextFunctionDeclaration.name],
      },
    }
  });

  if (result?.response?.candidates[0]?.content?.parts[0].functionCall &&
    result?.response?.candidates[0]?.content?.parts[0].functionCall.name === translateWithFoodContextFunctionDeclaration.name
  ) {
    console.log(JSON.stringify(result.response.candidates[0].content));
    const call = result.response.candidates[0].content.parts[0].functionCall;
    const jsonResponse = call.args;
    return {
      content: jsonResponse,
      metadata: result.response.usageMetadata
    };
  }

  return {
    content: translateWithFoodContextEmptyResponseCall(message, srcLang),
    metadata: result.response.usageMetadata
  };
}


// HTML Content
app.use(express.static(path.join(__dirname, '../dist/chat-with-gemini/browser')));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../dist/chat-with-gemini/browser/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});