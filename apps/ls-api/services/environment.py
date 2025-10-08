import os

DEVELOPMENT_MODE = "development"

mode = os.getenv("ENVIRONMENT", DEVELOPMENT_MODE)
