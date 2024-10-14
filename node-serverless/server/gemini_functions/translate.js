const {
  FunctionDeclarationSchemaType,
} = require('@google-cloud/vertexai');

const translateWithFoodContextFunctionDeclaration = {
  name: 'translate_with_food_context',
  description: 'Get the translation for a sentence from one origin language to a target language',
  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
      translation: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'The translated text'
      },
      // translation_ph: {
      //   type: FunctionDeclarationSchemaType.STRING,
      //   description: 'The translated text but translated in Tagalog'
      // },
      code: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'The language code of the translation'
      },
      confidence: {
        type: FunctionDeclarationSchemaType.NUMBER,
        description: 'The confidence level of the translation between 0 to 1'
      }
    },
    required: ['translation', 'confidence', 'code'],
  },
};

const translateWithFoodContextEmptyResponseCall = function(message, srcLang) {
  return {
    translated_from: {
      text: message,
      code: srcLang,
    },
    translated_to: null,
    confidence: 0,
  };
}

module.exports = {
  translateWithFoodContextFunctionDeclaration,
  translateWithFoodContextEmptyResponseCall,
};
