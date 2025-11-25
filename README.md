# LXSTS - Lightweight List Management

A self-hosted, database-less list management web app that uses JSON flat files for storage.

## Features

- **Lightweight**: No database required, just JSON files
- **Fast**: Docker startup in ~1 second
- **Simple**: Clean, intuitive interface
- **Offline Support**: Progressive Web App with service worker
- **Mobile Friendly**: Responsive design for all devices
- **List Features**: Checkboxes, quantities, indentation, drag-and-drop sorting
- **Search**: Full-text search across all lists
- **Authentication**: Simple username/password protection

## Getting Started

### Quick Start with Docker Compose

```yaml
version: "3"

services:
  lxsts:
    container_name: lxsts
    image: ghcr.io/effree/lxsts:latest
    ports:
      - '5123:5000'
    volumes:
      - ./data:/app/data
    environment:
      - LOGIN_USERNAME=admin
      - LOGIN_PASSWORD=changeme
      - SECRET_KEY=change-this-to-a-random-secret-key
    restart: unless-stopped
```

Save as `docker-compose.yml`, then run:

```bash
docker compose up -d
```

Access at: `http://localhost:5123`

### Configuration

Edit the environment variables in `docker-compose.yml`:

- `LOGIN_USERNAME`: Your login username
- `LOGIN_PASSWORD`: Your login password
- `SECRET_KEY`: Random string for session encryption (change this!)

### Changing the Port

Edit the ports section in `docker-compose.yml`:

```yaml
ports:
  - '5123:5000'  # Change 5123 to your desired port, do not change port 5000
```

## Data Storage

Lists are stored as JSON files in the `data/` directory. To backup:

```bash
cp -r data/ ~/backups/lxsts-$(date +%Y%m%d)/
```

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Python 3.11 + Flask + Gunicorn
- **Storage**: JSON flat files
- **Containerization**: Docker

## License

Available for personal and commercial use.

## Author

Jeffrey Meyer

## Acknowledgments

Inspired by [Flatnotes](https://github.com/dullage/flatnotes) for the lightweight, database-less approach.
