"""
Storage module for managing list data in JSON files.
Each list is stored as a separate JSON file in data/lists/
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'lists')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)


def _get_timestamp():
    """Get current timestamp in ISO format"""
    return datetime.utcnow().isoformat() + 'Z'


def _get_list_path(list_id: str) -> str:
    """Get the file path for a list"""
    return os.path.join(DATA_DIR, f"{list_id}.json")


def get_all_lists() -> List[Dict]:
    """
    Get metadata for all lists (without items).
    Returns list of dicts with id, name, created, modified, settings.
    """
    lists = []
    
    if not os.path.exists(DATA_DIR):
        return lists
    
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.json'):
            list_id = filename[:-5]  # Remove .json extension
            try:
                with open(os.path.join(DATA_DIR, filename), 'r') as f:
                    data = json.load(f)
                    # Return metadata only (no items)
                    lists.append({
                        'id': data.get('id', list_id),
                        'name': data.get('name', 'Untitled'),
                        'created': data.get('created'),
                        'modified': data.get('modified'),
                        'settings': data.get('settings', {})
                    })
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error reading {filename}: {e}")
                continue
    
    # Sort by modified date, newest first
    lists.sort(key=lambda x: x.get('modified', ''), reverse=True)
    return lists


def get_list(list_id: str) -> Optional[Dict]:
    """
    Get a complete list including all items.
    Returns None if list doesn't exist.
    """
    path = _get_list_path(list_id)
    
    if not os.path.exists(path):
        return None
    
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error reading list {list_id}: {e}")
        return None


def create_list(data: Dict) -> str:
    """
    Create a new list.
    Returns the new list ID.
    """
    list_id = str(uuid.uuid4())
    timestamp = _get_timestamp()
    
    list_data = {
        'id': list_id,
        'name': data.get('name', 'Untitled'),
        'created': timestamp,
        'modified': timestamp,
        'settings': {
            'sort': data.get('settings', {}).get('sort', True),
            'checkbox': data.get('settings', {}).get('checkbox', True),
            'quantity': data.get('settings', {}).get('quantity', False)
        },
        'items': data.get('items', [])
    }
    
    path = _get_list_path(list_id)
    
    try:
        with open(path, 'w') as f:
            json.dump(list_data, f, indent=2)
        return list_id
    except IOError as e:
        print(f"Error creating list: {e}")
        raise


def update_list(list_id: str, data: Dict) -> bool:
    """
    Update an existing list.
    Returns True if successful, False if list doesn't exist.
    """
    path = _get_list_path(list_id)
    
    if not os.path.exists(path):
        return False
    
    # Read existing data to preserve created timestamp
    try:
        with open(path, 'r') as f:
            existing = json.load(f)
    except (json.JSONDecodeError, IOError):
        existing = {}
    
    # Update with new data
    list_data = {
        'id': list_id,
        'name': data.get('name', existing.get('name', 'Untitled')),
        'created': existing.get('created', _get_timestamp()),
        'modified': _get_timestamp(),
        'settings': {
            'sort': data.get('settings', {}).get('sort', True),
            'checkbox': data.get('settings', {}).get('checkbox', True),
            'quantity': data.get('settings', {}).get('quantity', False)
        },
        'items': data.get('items', [])
    }
    
    try:
        with open(path, 'w') as f:
            json.dump(list_data, f, indent=2)
        return True
    except IOError as e:
        print(f"Error updating list {list_id}: {e}")
        return False


def delete_list(list_id: str) -> bool:
    """
    Delete a list.
    Returns True if successful, False if list doesn't exist.
    """
    path = _get_list_path(list_id)
    
    if not os.path.exists(path):
        return False
    
    try:
        os.remove(path)
        return True
    except IOError as e:
        print(f"Error deleting list {list_id}: {e}")
        return False
