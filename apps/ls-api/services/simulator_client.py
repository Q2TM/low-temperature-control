import os

from simulator_client import ApiClient, Configuration, SimulatorApi

HOST = os.getenv("SIMULATOR_API_URL", "http://localhost:8101")

simulator_api = SimulatorApi(
    ApiClient(Configuration(host=HOST)))
