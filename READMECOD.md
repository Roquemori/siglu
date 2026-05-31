podman logs siglu-backend
podman logs siglu-frontend

podman-compose down
podman-compose build backend
podman-compose up -d

podman-compose down
podman-compose build --no-cache backend
podman-compose up -d


podman-compose down
podman-compose build frontend
podman-compose up -d

podman-compose restart frontend

# CAMBIOS AL CODIGO
podman-compose build frontend
podman-compose up -d --force-recreate frontend
