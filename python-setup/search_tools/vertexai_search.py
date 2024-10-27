from dotenv import load_dotenv
import requests
import os

load_dotenv("/opt/env/.env")

GCP_PYTHON_SERVERLESS_URL = os.getenv("GCP_PYTHON_SERVERLESS_URL")

def query(product_name: str, product_description: str):
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
