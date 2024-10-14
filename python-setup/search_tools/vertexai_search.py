from google.api_core.client_options import ClientOptions
from google.cloud import discoveryengine_v1 as discoveryengine
from dotenv import load_dotenv
import os
import json

load_dotenv("/opt/env/.env")

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_VERTEXAI_SEARCH_DATA_STORE_ID = os.getenv("GCP_VERTEXAI_SEARCH_DATA_STORE_ID")
GCP_VERTEXAI_SEARCH_LOCATION = os.getenv("GCP_VERTEXAI_SEARCH_LOCATION")

search_client_options = ClientOptions(api_endpoint=f"{GCP_VERTEXAI_SEARCH_LOCATION}-discoveryengine.googleapis.com")
search_client = discoveryengine.SearchServiceClient(
  client_options=search_client_options
)
search_serving_config = f"projects/{GCP_PROJECT_ID}/locations/{GCP_VERTEXAI_SEARCH_LOCATION}/collections/default_collection/dataStores/{GCP_VERTEXAI_SEARCH_DATA_STORE_ID}/servingConfigs/default_search:search"

def query(product_name: str, product_description: str):
  """
  Use this tool to only search for Google Merch Store products. Else don't use this tool.

  Find a product with the product_name and product_description from
  Google Merch Shop and returns a dictionary containing product details.
  """

  data = do_vertexai_search(product_name + " " + product_description)  # calls Vertex AI Search
  productDetails = f"""
    {data['gms_name']} is a product sold at Google Merch Shop. The price is {data['price']}.
    {data['gms_desc']}. You can buy the product at their web site: {data['link']}"
  """

  return {"productDetails": productDetails}

def do_vertexai_search(search_query):
  # build a search request
  request = discoveryengine.SearchRequest(
    serving_config = search_serving_config,
    query = search_query,
    page_size = 1, # Hardcoded to 1 for simplicity
    query_expansion_spec = discoveryengine.SearchRequest.QueryExpansionSpec(
        condition = discoveryengine.SearchRequest.QueryExpansionSpec.Condition.AUTO,
    ),
    spell_correction_spec = discoveryengine.SearchRequest.SpellCorrectionSpec(
        mode = discoveryengine.SearchRequest.SpellCorrectionSpec.Mode.AUTO
    ),
  )

  # search
  resp_pager = search_client.search(request)

  # parse the results
  response = discoveryengine.SearchResponse(
      results = resp_pager.results,
      facets = resp_pager.facets,
      total_size = resp_pager.total_size,
      attribution_token = resp_pager.attribution_token,
      next_page_token = resp_pager.next_page_token,
      corrected_query = resp_pager.corrected_query,
      summary = resp_pager.summary,
  )
  response_json = json.loads(
      discoveryengine.SearchResponse.to_json(
          response,
          including_default_value_fields=True,
          use_integers_for_enums=False,
      )
  )

  return response_json["results"][0]['document']['structData']
