from mangum import Mangum

from core.config import config
from core.server import app

# For AWS Lambda (Ignore for local development)
lambda_handler = Mangum(app)

# For local development
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app="core.server:app",
        host="0.0.0.0",
        port=9095,
        reload=True if config.ENVIRONMENT != "production" else False,
        workers=1,
    )
