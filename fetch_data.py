import requests

def get_fx_price(base, quote):
    url = f"https://api.exchangerate.host/latest?base={base}&symbols={quote}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if 'rates' in data and quote in data['rates']:
            return data['rates'][quote]
        else:
            raise Exception(f"Rates not available in API response: {data}")
    else:
        raise Exception(f"Error fetching data: {response.status_code}, {response.text}")

def get_multiple_fx_prices(pairs):
    prices = {}
    for pair in pairs:
        base, quote = pair.split('/')
        try:
            price = get_fx_price(base, quote)
            prices[pair] = price
        except Exception as e:
            print(f"Error fetching price for {pair}: {e}")
    return prices

if __name__ == "__main__":
    pairs = ["EUR/USD", "USD/JPY", "GBP/USD"]
    prices = get_multiple_fx_prices(pairs)
    for pair, price in prices.items():
        print(f"{pair}: {price}")
