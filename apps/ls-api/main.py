if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="localhost", port=8000, workers=1)
    # uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
