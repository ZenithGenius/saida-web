#!/bin/bash
set -e

# Variables
IMAGE_NAME="saida-web"
CONTAINER_NAME="saida-web-app"
PORT="8080"

echo "🔨 Construction de l'image Docker: $IMAGE_NAME"
docker build -t $IMAGE_NAME .

echo "🚀 Démarrage du conteneur: $CONTAINER_NAME sur le port $PORT"
# Arrêter et supprimer le conteneur s'il existe déjà
docker rm -f $CONTAINER_NAME 2>/dev/null || true

# Démarrer le nouveau conteneur
docker run -d --name $CONTAINER_NAME -p $PORT:80 $IMAGE_NAME

echo "✅ Application déployée avec succès!"
echo "🌐 Accédez à l'application sur: http://localhost:$PORT" 