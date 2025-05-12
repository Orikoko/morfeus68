import os
from dotenv import load_dotenv

load_dotenv()

print("FX_API_KEY:", os.getenv('FX_API_KEY'))
print("OPENAI_API_KEY:", os.getenv('OPENAI_API_KEY'))
print("TELEGRAM_BOT_TOKEN:", os.getenv('TELEGRAM_BOT_TOKEN'))
