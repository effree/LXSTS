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
├── docker-compose.yml    # Docker services
└── README.md             # This file
```

## 🚦 Getting Started

### 1. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and set your own credentials:

```bash
# Login Credentials
LOGIN_USERNAME=your-username
LOGIN_PASSWORD=your-secure-password

# Flask Secret Key (generate a random string)
SECRET_KEY=your-random-secret-key-here

# Flask Debug Mode
FLASK_DEBUG=False
```

> ⚠️ **Security Note**: Never commit your `.env` file to Git! It's already in `.gitignore`.

### 2. Build the Application

```bash
docker compose build
```

**Build time**: ~10 seconds  
**Image size**: ~200MB

### 3. Start the Application

```bash
docker compose up -d
```

**Startup time**: ~1 second

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost
```

Login with the credentials you set in your `.env` file.

### 5. Stop the Application

```bash
docker compose down
```

## 🔧 Configuration

### Environment Variables

All configuration is done through the `.env` file (copy from `.env.example`):

- `LOGIN_USERNAME`: Your login username
- `LOGIN_PASSWORD`: Your login password  
- `SECRET_KEY`: Flask secret key for session encryption
- `FLASK_DEBUG`: Set to `False` in production

> ⚠️ **Security Note**: Always use strong passwords and change the default SECRET_KEY!

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

## 💾 Data Storage

Lists are stored as individual JSON files in `backend/data/lists/`:

```json
{
  "id": "uuid-here",
  "name": "Shopping List",
  "created": "2025-11-23T21:00:00Z",
  "modified": "2025-11-23T21:15:00Z",
  "settings": {
    "sort": true,
    "checkbox": true,
    "quantity": false
  },
  "items": [
    {
      "checkbox": false,
      "quantity": 0,
      "item": "Milk",
      "indent": 0
    }
  ]
}
```

### Backup

Simply copy the `backend/data/lists/` directory:

```bash
cp -r backend/data/lists/ ~/backups/lxsts-$(date +%Y%m%d)/
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

### Lists
- `GET /api/lists` - Get all lists (metadata only)
- `GET /api/lists/<id>` - Get specific list with items
- `POST /api/lists` - Create new list
- `PUT /api/lists/<id>` - Update list
- `DELETE /api/lists/<id>` - Delete list

### Health
- `GET /api/health` - Health check

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

## 📊 Performance

| Metric | Value |
|--------|-------|
| Docker build time | ~10 seconds |
| Image size | ~200MB |
| Startup time | ~1 second |
| Containers | 2 (nginx + backend) |
| Memory usage | ~100MB total |

## 🎯 Roadmap

- [x] Complete list.html conversion from PHP
- [x] Complete all.html conversion from PHP
- [x] Implement search across all lists
- [ ] Add share functionality
- [ ] Add data export/import
- [ ] Multi-user support
- [ ] List templates
- [ ] Enhanced PWA features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is available for personal and commercial use.

## 👤 Author

Jeffrey Meyer

## 🙏 Acknowledgments

- Inspired by [Flatnotes](https://github.com/dullage/flatnotes) for the lightweight, database-less approach
- Flask for the minimal web framework
- Nginx for reliable web serving
- Docker for containerization
