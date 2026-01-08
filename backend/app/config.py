# Filename: backend/app/config.py
# Configuration for the Scholarship Finder application

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from dotenv import load_dotenv
import os

# Load .env file explicitly
load_dotenv()

class Settings(BaseSettings):
    # Google Generative AI API
    google_api_key: str
    
    # Google Sheets
    google_sheets_id: str
    google_service_account_email: str
    google_private_key: str
    google_apps_script_url: str
    
    # Email Configuration
    smtp_user: str
    smtp_password: str
    smtp_host: str
    smtp_port: int
    
    # Server Configuration
    port: int = 5000
    node_env: str = "development"
    frontend_url: str = "https://scholarship-finder-rouge.vercel.app"
    
    model_config = ConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

settings = Settings()