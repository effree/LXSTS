"""
LXSTS Flask Backend API
Lightweight list management application with JSON file storage.
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import storage
import auth

app = Flask(__name__, static_url_path='', static_folder='static')
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Enable CORS for frontend
CORS(app, supports_credentials=True, origins=['http://localhost', 'http://localhost:80'])

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

# Session configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True


# ============================================================================
# Authentication Endpoints
# ============================================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and create session"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username = data.get('username', '')
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    if auth.verify_credentials(username, password):
        session['logged_in'] = True
        session['username'] = username
        return jsonify({'success': True, 'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logout successful'}), 200


@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    """Check if user is authenticated"""
    if session.get('logged_in'):
        return jsonify({'authenticated': True, 'username': session.get('username')}), 200
    else:
        return jsonify({'authenticated': False}), 200


# ============================================================================
# Helper Functions
# ============================================================================

def require_auth(f):
    """Decorator to require authentication for endpoints"""
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function


# ============================================================================
# List Management Endpoints
# ============================================================================

@app.route('/api/lists', methods=['GET'])
@require_auth
def get_lists():
    """Get all lists (metadata only, no items)"""
    try:
        lists = storage.get_all_lists()
        return jsonify({'lists': lists}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/lists/<list_id>', methods=['GET'])
@require_auth
def get_list(list_id):
    """Get a specific list with all items"""
    try:
        list_data = storage.get_list(list_id)
        
        if list_data is None:
            return jsonify({'error': 'List not found'}), 404
        
        return jsonify(list_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/lists', methods=['POST'])
@require_auth
def create_list():
    """Create a new list"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if not data.get('name'):
        return jsonify({'error': 'List name is required'}), 400
    
    try:
        list_id = storage.create_list(data)
        return jsonify({'id': list_id, 'message': 'List created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/lists/<list_id>', methods=['PUT'])
@require_auth
def update_list(list_id):
    """Update an existing list"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        success = storage.update_list(list_id, data)
        
        if not success:
            return jsonify({'error': 'List not found'}), 404
        
        return jsonify({'id': list_id, 'message': 'List updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/lists/<list_id>', methods=['DELETE'])
@require_auth
def delete_list(list_id):
    """Delete a list"""
    try:
        success = storage.delete_list(list_id)
        
        if not success:
            return jsonify({'error': 'List not found'}), 404
        
        return jsonify({'message': 'List deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Health Check
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'LXSTS API'}), 200


# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    # Run on all interfaces, port 5000
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('FLASK_DEBUG', 'False') == 'True')
