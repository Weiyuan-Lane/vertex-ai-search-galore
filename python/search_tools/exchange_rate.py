import requests

def query(
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
  except:
    return {"message": f"Sorry, I couldn't find the exchange rate between {currency_from} and {currency_to}."}

  return data
