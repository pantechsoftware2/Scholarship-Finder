# Filename: backend/run.py
# No changes.

"""
Scholarship Finder Backend
AI-powered scholarship calculator for Indian students using Google Gemini API
"""

import os
import sys
import asyncio
import threading

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
import uvicorn

def run_server():
    """Run the uvicorn server"""
    config = uvicorn.Config(
        app=app,
        host="127.0.0.1",
        port=5000,
        reload=False,
        log_level="info",
        access_log=True,
        lifespan="off"  # Disable lifespan events
    )
    server = uvicorn.Server(config)
    asyncio.run(server.serve())

if __name__ == "__main__":
    print("""
    ============================================================
    Scholarship Finder Backend
    AI-Powered Scholarship Calculator
    
    API will be available at:
    -> http://localhost:5000
    -> http://localhost:5000/docs (Swagger UI)
    -> http://localhost:5000/redoc (ReDoc)
    
    Frontend: http://localhost:3000
    Press Ctrl+C to stop the server
    ============================================================
    """)
    
    try:
        # Import after settings are loaded
        from app.config import settings
        print(f"[INFO] Backend configured successfully!")
        print(f"[INFO] API Key loaded: {bool(settings.google_api_key)}")
        print(f"[INFO] SMTP configured: {bool(settings.smtp_user)}")
        print()
        
        # Run the server
        run_server()
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped by user")
    except Exception as e:
        print(f"[ERROR] Failed to start server: {e}")
        import traceback
        traceback.print_exc()