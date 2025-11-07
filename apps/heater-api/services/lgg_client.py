import os

from lgg_client import ReadingApi, ApiClient, Configuration

HOST = os.getenv("LGG_URL", "http://localhost:8000")

config = Configuration(host=HOST)
api_client = ApiClient(config)

readingApi = ReadingApi(api_client=api_client)
