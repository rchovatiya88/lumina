from fastapi import FastAPI


app = FastAPI(title="Lumina Backend", version="1.0.0")


@app.get("/")
def root():
    return {"status": "ok", "service": "lumina-backend"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
