import os
import argparse
import vertexai
from vertexai.preview import reasoning_engines
from dotenv import load_dotenv

# Tools =======================================================================
from search_tools import wikipedia, vertexai_search, exchange_rate
from search_tools.wikipedia import query as wikipedia_query
from search_tools.vertexai_search import query as search_google_merch_shop_query
from search_tools.exchange_rate import query as exchange_rate_query
# =============================================================================

load_dotenv("/opt/env/.env")

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_REGION = os.getenv("GCP_REGION")
GCP_GEMINI_VER = os.getenv("GCP_GEMINI_VER")
GCP_VERTEXAI_REASONING_ENGINE_BUCKET = os.getenv("GCP_VERTEXAI_REASONING_ENGINE_BUCKET")

vertexai.init(
  project=GCP_PROJECT_ID,
  location=GCP_REGION,
  staging_bucket=GCP_VERTEXAI_REASONING_ENGINE_BUCKET,
)

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
      search_google_merch_shop_query,
      # exchange_rate_query,
      # wikipedia_query,
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
        "google-cloud-discoveryengine"
      ],
  )

def list_deployed_reasoning_engines():
  print(reasoning_engines.ReasoningEngine.list())

def delete_reasoning_engine(resource_id):
  remote_app = reasoning_engines.ReasoningEngine(resource_id)
  remote_app.delete()

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Manage Reasoning Engines")
  parser.add_argument("command", choices=["deploy", "list", "delete", "test"], help="Command to execute")
  parser.add_argument("--resource_id", help="Resource ID for deletion")

  args = parser.parse_args()

  if args.command == "deploy":
    deploy_reasoning_engine()
  elif args.command == "list":
    list_deployed_reasoning_engines()
  elif args.command == "delete":
    if args.resource_id:
      delete_reasoning_engine(args.resource_id)
    else:
      print("Please provide a resource ID for deletion")
  elif args.command == "test":
    agent = get_agent()
    print(agent.query(input="Google Bike Enamel Pin. Where can I buy it? Write the answer in plaintext."))
    # print(agent.query(input="What is the exchange rate between SGD and MYR."))
    # print(agent.query(input="Is Choa Chu Kang a place?"))
