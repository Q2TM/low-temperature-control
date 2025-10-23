# Use official Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy only Python project files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir fastapi uvicorn pydantic

# Expose the port FastAPI will run on
EXPOSE 8000

# Default command to run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
