# Utiliser une image de base Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port par défaut de Vite
EXPOSE 5173

# Commande pour démarrer le serveur de développement
CMD ["npm", "run", "dev"]
