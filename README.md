# LXSTS - Lightweight Lists Web Application

A self-hosted, database-less list management web app built with Python/Flask and JSON flat file storage.

## 🚀 Features

- **Lightweight Architecture**: Python/Flask backend with JSON file storage (no database required)
- **Fast Deployment**: Docker build in ~10 seconds, startup in ~1 second
- **Simple Storage**: Human-readable JSON files, easy to backup and migrate
- **Progressive Web App**: Offline support with service workers
- **Responsive Design**: Works on desktop, tablet, and mobile
- **List Management**: Create, edit, delete, and share lists
- **Item Features**: Checkboxes, quantities, indentation, drag-and-drop sorting
- **Search**: Full-text search across all lists
- **Authentication**: Simple username/password protection

## 📋 Prerequisites

- Docker Desktop installed and running
- Git (for version control)

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Python 3.11 + Flask
- **Storage**: JSON flat files
- **Web Server**: Nginx
- **Containerization**: Docker & Docker Compose

## 📦 Project Structure

```
LXSTS/
├── app/                    # Frontend (static HTML/CSS/JS)
│   ├── index.html         # Login page
│   ├── home.html          # Home page
│   ├── list.html          # List editor (TODO)
│   ├── all.html           # All lists view (TODO)
│   ├── css/               # Stylesheets
│   └── js/
│       ├── api.js         # API communication module
│       └── init.js        # Initialization scripts
├── backend/               # Python/Flask API
│   ├── app.py            # Main Flask application
│   ├── storage.py        # JSON file storage module
│   ├── auth.py           # Authentication module
│   ├── requirements.txt  # Python dependencies
│   ├── Dockerfile        # Backend container image
│   └── data/
│       └── lists/        # JSON list files
├── config/
│   └── default.conf      # Nginx configuration

### Environment Variables

All configuration is done through the `.env` file (copy from `.env.example`):

- `LOGIN_USERNAME`: Your login username
- `LOGIN_PASSWORD`: Your login password  
- `SECRET_KEY`: Flask secret key for session encryption
- `FLASK_DEBUG`: Set to `False` in production

### Changing the Port

By default, the application runs on port 80. To change it:

1. Edit `docker-compose.yml`
2. Find the `web` service ports section:
   ```yaml
   ports:
     - '80:80'
   ```
3. Change the **first** number to your desired port (e.g., `8080:80` for port 8080)
4. Restart: `docker compose down && docker compose up -d`
5. Access at: `http://localhost:8080`

### Ports

- **80**: Web server (Nginx)
- **5000**: Backend API (internal, not exposed)

## 🐳 Docker Services

### Web (Nginx)
- Serves static files (HTML/CSS/JS)
- Proxies API requests to Flask backend
- Configuration: `config/default.conf`

### Backend (Python/Flask)
- REST API for list management
- JSON file storage
- Session-based authentication

### Backup

Simply copy the `backend/data/lists/` directory:

```bash
cp -r backend/data/lists/ ~/backups/lxsts-$(date +%Y%m%d)/
```

## 🔍 Troubleshooting

### Containers won't start
```bash
# Check container logs
docker compose logs

# Check specific service
docker compose logs backend
docker compose logs web
```

### API not responding
```bash
# Test API health
curl http://localhost/api/health

# Check backend logs
docker compose logs backend
```

### Permission issues with data directory
```bash
# Fix permissions (Unix/Mac)
sudo chown -R $(whoami) backend/data
```

## 🛡️ Security Recommendations

Before deploying to production:

1. Change default username and password
2. Use strong SECRET_KEY in environment variables
3. Enable HTTPS with SSL certificates
4. Use environment files (`.env`) instead of hardcoded credentials
5. Regular security updates for Docker images
6. Consider adding rate limiting to API endpoints

## 🎯 Roadmap

- [x] Complete list.html conversion from PHP
- [x] Complete all.html conversion from PHP
- [x] Implement search across all lists
- [ ] Add share functionality
- [ ] Add data export/import
- [ ] Multi-user support
- [ ] List templates
- [ ] Enhanced PWA features

## 📄 License

This project is available for personal and commercial use.

## 👤 Author

Jeffrey Meyer

## 🙏 Acknowledgments

- Inspired by [Flatnotes](https://github.com/dullage/flatnotes) for the lightweight, database-less approach
- Flask for the minimal web framework
- Nginx for reliable web serving
- Docker for containerization
