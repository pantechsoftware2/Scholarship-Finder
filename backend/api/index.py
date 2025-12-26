import os
import sys

# Add backend root to Python path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import your EXISTING FastAPI app
from app.main import app
