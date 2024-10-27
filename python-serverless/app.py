import os
from flask import Flask, request, jsonify
import json
from dotenv import load_dotenv
from google.api_core.client_options import ClientOptions
from google.cloud import discoveryengine_v1 as discoveryengine

load_dotenv("/opt/env/.env")


app = Flask(__name__)

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_VERTEXAI_SEARCH_ENGINE_ID = os.getenv("GCP_VERTEXAI_SEARCH_ENGINE_ID")
GCP_VERTEXAI_SEARCH_LOCATION = os.getenv("GCP_VERTEXAI_SEARCH_LOCATION")

search_client_options = ClientOptions(api_endpoint=f"{GCP_VERTEXAI_SEARCH_LOCATION}-discoveryengine.googleapis.com")
search_client = discoveryengine.SearchServiceClient(
  client_options=search_client_options
)
search_serving_config = f"projects/{GCP_PROJECT_ID}/locations/{GCP_VERTEXAI_SEARCH_LOCATION}/collections/default_collection/engines/{GCP_VERTEXAI_SEARCH_ENGINE_ID}/servingConfigs/default_search:search"

def do_vertexai_search(search_query, page_size=10, offset=0):
  # build a search request
  request = discoveryengine.SearchRequest(
    serving_config = search_serving_config,
    query = search_query,
    page_size = page_size,
    offset = offset,
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

  return response_json['results']

@app.route("/search.json", methods=["GET"])
def vertex_ai_search_engine():
  query = request.args.get("query")
  if not query:
    return jsonify({"error": "'query' parameter is required as non-empty string"}), 400

  page = request.args.get("page", type=int, default=1)
  if page and page < 1:
    return jsonify({"error": "'page' parameter is required as positive int"}), 400

  per_page = request.args.get("per_page", type=int, default=10)
  if per_page and (per_page < 1 or per_page > 100):
    return jsonify({"error": "'per_page' parameter is required as positive int smaller than 100"}), 400

  if page < 1:
    page = 1
  if per_page < 1:
    per_page = 10

  offset = page * per_page - per_page

  results = do_vertexai_search(query, page_size=per_page, offset=offset)
  return jsonify(results), 200

if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0", port=5000)
