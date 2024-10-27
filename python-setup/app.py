import os
import argparse
import vertexai
import requests
from vertexai.preview import reasoning_engines
from dotenv import load_dotenv

# Tools =======================================================================
# from search_tools.wikipedia import query as wikipedia_query
# from search_tools.vertexai_search import query as search_google_merch_shop_query
# from search_tools.exchange_rate import query as exchange_rate_query
# =============================================================================

load_dotenv("/opt/env/.env")

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_REGION = os.getenv("GCP_REGION")
GCP_GEMINI_VER = os.getenv("GCP_GEMINI_VER")
GCP_VERTEXAI_REASONING_ENGINE_BUCKET = os.getenv("GCP_VERTEXAI_REASONING_ENGINE_BUCKET")
GCP_PYTHON_SERVERLESS_URL = os.getenv("GCP_PYTHON_SERVERLESS_URL")

vertexai.init(
  project=GCP_PROJECT_ID,
  location=GCP_REGION,
  staging_bucket=GCP_VERTEXAI_REASONING_ENGINE_BUCKET,
)

def vertex_ai_query(product_name: str, product_description: str):
  """
  Use this tool to only search for Google Merch Store products. Else don't use this tool.

  Find a product with the product_name and product_description from
  Google Merch Shop and returns a dictionary containing product details.
  """

  query = product_name + " " + product_description
  url = f"{GCP_PYTHON_SERVERLESS_URL}/search.json?query={query}&page=1&page_size=1"
  results = requests.get(url).json()

  target_result = results[0]['document']['structData']

  productDetails = f"""
    {target_result['gms_name']} is a product sold at Google Merch Shop. The price is {target_result['price']}.
    {target_result['gms_desc']}. You can buy the product at their web site: {target_result['link']}"
  """

  return {"productDetails": productDetails}

def get_agent():
  return reasoning_engines.LangchainAgent(
    model = GCP_GEMINI_VER,
    model_kwargs = {
      "temperature": 0.28,
      "max_output_tokens": 1000,
      "top_p": 0.95,
      "top_k": None,
    },
    tools = [
      vertex_ai_query
    ],
    agent_executor_kwargs={"return_intermediate_steps": True},
  )

def deploy_reasoning_engine():
  agent = get_agent()
  reasoning_engines.ReasoningEngine.create(
      agent,
      display_name="",
      description="",
      requirements=[
        "google-cloud-aiplatform[langchain,reasoningengine]",
        "requests",
      ],
  )

def list_deployed_reasoning_engines():
  print(reasoning_engines.ReasoningEngine.list())

def query_remote(resource_id):
  remote_app = reasoning_engines.ReasoningEngine(resource_id)
  query = remote_app.query(input="Google Bike Enamel Pin. Where can I buy it? Write the answer in plaintext.")
  print(f"\n input: {query['input']}")
  print(f"output: {query['output']}")

def delete_reasoning_engine(resource_id):
  remote_app = reasoning_engines.ReasoningEngine(resource_id)
  remote_app.delete()

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Manage Reasoning Engines")
  parser.add_argument("command", choices=["deploy", "list", "delete", "test", "query_remote"], help="Command to execute")
  parser.add_argument("--resource_id", help="Resource ID for remote instance")

  args = parser.parse_args()
  print(args)

  if args.command == "deploy":
    deploy_reasoning_engine()
  elif args.command == "list":
    list_deployed_reasoning_engines()
  elif args.command == "query_remote":
    if args.resource_id is not None:
      query_remote(args.resource_id)
    else:
      print("Please provide a resource ID for querying remote instance")
  elif args.command == "delete":
    if args.resource_id:
      delete_reasoning_engine(args.resource_id)
    else:
      print("Please provide a resource ID for deletion")
  elif args.command == "test":
    agent = get_agent()
    query = agent.query(input="Google Bike Enamel Pin. Where can I buy it? Write the answer in plaintext.")
    print(f"\n input: {query['input']}")
    print(f"output: {query['output']}")
