"""
Authentication module for simple username/password authentication.
"""

import bcrypt
import os
from typing import Optional

# Get credentials from environment variables
DEFAULT_USERNAME = os.getenv('LOGIN_USERNAME', 'admin')
DEFAULT_PASSWORD = os.getenv('LOGIN_PASSWORD', 'changeme')  # Default for development only

# Hash the default password on startup
DEFAULT_PASSWORD_HASH = bcrypt.hashpw(DEFAULT_PASSWORD.encode('utf-8'), bcrypt.gensalt())


def verify_credentials(username: str, password: str) -> bool:
    """
    Verify username and password.
    Returns True if credentials are valid, False otherwise.
    """
    if username != DEFAULT_USERNAME:
        return False
    
    try:
        return bcrypt.checkpw(password.encode('utf-8'), DEFAULT_PASSWORD_HASH)
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False


def hash_password(password: str) -> str:
    """
    Hash a password for storage.
    Returns the hashed password as a string.
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
