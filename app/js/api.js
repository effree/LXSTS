/**
 * API Module for LXSTS Frontend
 * Handles all communication with the Flask backend API
 */

const API_BASE = '/api';

const API = {
    /**
     * Authentication
     */
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async logout() {
        try {
            const response = await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            return await response.json();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    async checkAuth() {
        try {
            const response = await fetch(`${API_BASE}/auth/status`, {
                credentials: 'include'
            });

            const data = await response.json();
            return data.authenticated;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    },

    /**
     * List Management
     */
    async getLists() {
        try {
            const response = await fetch(`${API_BASE}/lists`, {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/';
                    return;
                }
                throw new Error('Failed to fetch lists');
            }

            const data = await response.json();
            return data.lists;
        } catch (error) {
            console.error('Get lists error:', error);
            throw error;
        }
    },

    async getList(listId) {
        try {
            const response = await fetch(`${API_BASE}/lists/${listId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/';
                    return;
                }
                if (response.status === 404) {
                    throw new Error('List not found');
                }
                throw new Error('Failed to fetch list');
            }

            return await response.json();
        } catch (error) {
            console.error('Get list error:', error);
            throw error;
        }
    },

    async createList(listData) {
        try {
            const response = await fetch(`${API_BASE}/lists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(listData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create list');
            }

            return await response.json();
        } catch (error) {
            console.error('Create list error:', error);
            throw error;
        }
    },

    async updateList(listId, listData) {
        try {
            const response = await fetch(`${API_BASE}/lists/${listId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(listData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update list');
            }

            return await response.json();
        } catch (error) {
            console.error('Update list error:', error);
            throw error;
        }
    },

    async deleteList(listId) {
        try {
            const response = await fetch(`${API_BASE}/lists/${listId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete list');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete list error:', error);
            throw error;
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
