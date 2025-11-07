from lgg_client import ReadingApi, ApiClient, Configuration

config = Configuration(host="http://localhost:8000")
api_client = ApiClient(config)

readingApi = ReadingApi(api_client=api_client)
