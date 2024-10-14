import requests

def query(
  query: str,
):
  """
  Use this tool to search for information on a places from Wikipedia. Else don't use this tool.

  Args:
      query: the name of object or topic to find.

  Example: {"answer": "Southeast Asia is home to over 650 million people, representing hundreds of ethnic groups and languages. Major countries like Indonesia, the Philippines, and Vietnam each have distinct cultures and traditions."}
  """

  try:
    wiki_title = search_wiki_title(query)
    wiki_full_text = get_wiki_full_text(wiki_title)
  except Exception as e:
    return {"answer": "Sorry, I couldn't find any information on that topic."}

  return {"answer": wiki_full_text}

# Search for a relevant wikipedia article title
def search_wiki_title(query):
  url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&srlimit=1&format=json"
  resp = requests.get(url)
  return resp.json()["query"]["search"][0]["title"]

# From previously found title, get the article text
def get_wiki_full_text(wiki_title):
  url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles={wiki_title}&explaintext=true&format=json"
  response = requests.get(url)
  data = response.json()
  page_id = next(iter(data["query"]["pages"]))
  plain_text = data["query"]["pages"][page_id]["extract"]
  return plain_text
