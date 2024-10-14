import os
import argparse
import vertexai
from vertexai.preview import reasoning_engines
from dotenv import load_dotenv
import requests

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

def currency_query(
    currency_from: str,
    currency_to: str
):
  """
  Use this tool to only retrieves the exchange rate between two currencies. Else don't use this tool.

  Uses the Frankfurter API (https://api.frankfurter.app/) to obtain
  exchange rate data.

  Args:
    currency_from: The base currency (3-letter currency code).
      Defaults to "USD" (US Dollar).
    currency_to: The target currency (3-letter currency code).
      Defaults to "EUR" (Euro).

  Returns:
    dict: A dictionary containing the exchange rate information.
      Example: {"amount": 1.0, "base": "USD", "date": "2023-11-24",
        "rates": {"EUR": 0.95534}}
  """
  data = {}
  try:
    response = requests.get(
      f"https://api.frankfurter.app/latest",
      params={"base": currency_from, "symbols": currency_to},
    )
    data = response.json()
  except Exception as e:
    print(e)
    return {"message": f"Sorry, I couldn't find the exchange rate between {currency_from} and {currency_to}."}

  return data

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
      currency_query,
    ],
    model_tool_kwargs = {
      "tool_config": {
        "function_calling_config": {
          "mode": "ANY",
        },
      },
    },
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
    query_1 = agent.query(input="What is the exchange rate between SGD and MYR.")
    print(f"query 1 input: {query_1['input']}")
    print(f"query 1 input: {query_1['output']}")
    query_2 = agent.query(input="Can you tell me about Southeast Asia?")
    print(f"query 2 input: {query_2['input']}")
    print(f"query 2 input: {query_2['output']}")
