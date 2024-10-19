const { FunctionDeclarationSchemaType } = require('@google-cloud/vertexai');
const axios = require('axios');

const getWikipediaContentFunctionDeclaration = {
  name: 'get_wikipedia_content',
  description: 'Wikipedia is an online encyclopedia that provides information on a wide range of topics. This function will return the content of a Wikipedia article based on the subject provided.',
  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
      subject: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'The name of object or topic to find.'
      },
    },
    required: ['subject'],
  },
};

async function getWikipediaContent(subject) {
  try {
    const subjectTitle = await searchWikiTitle(subject);
    if (subjectTitle) {
      const answer = await getWikiFullText(subjectTitle);
      return answer;
    }

    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Search for a relevant wikipedia article title
async function searchWikiTitle(subject) {
  const response = await axios.get('https://en.wikipedia.org/w/api.php', {
    params: {
      action: 'query',
      list: 'search',
      srsearch: subject,
      srlimit: 1,
      format: 'json',
    }
  });

  if (response?.data?.query?.search &&
    response?.data?.query?.search.length > 0 &&
    response?.data?.query?.search[0]?.title) {

    return response.data.query.search[0].title
  }

  return null;
}

// From previously found title, get the article text
async function getWikiFullText(wikiTitle){
  const response = await axios.get('https://en.wikipedia.org/w/api.php', {
    params: {
      action: 'query',
      prop: 'extracts',
      titles: wikiTitle,
      explaintext: 'true',
      format: 'json',
    }
  });

  if (response?.data?.query?.pages) {
    const keys = Object.keys(response?.data?.query?.pages);
    const pages = response?.data?.query?.pages;

    if (keys.length > 0 && pages[keys[0]]?.extract) {
      return pages[keys[0]].extract;
    }
  }

  return null;
}

module.exports = {
  getWikipediaContentFunctionDeclaration,
  getWikipediaContent,
};
