# SAIDA Web - Application Cartographique

Une application web moderne de cartographie pour explorer et visualiser les infrastructures et services de la ville d'Ebolowa.

## Fonctionnalités

- Affichage et gestion des couches cartographiques
- Calcul d'itinéraires entre différents points d'intérêt
- Outils de dessin pour marquer des zones sur la carte
- Interface utilisateur intuitive et réactive

## Prérequis

- Node.js 18.x ou supérieur
- npm 8.x ou supérieur
- Pour le déploiement en conteneur: Docker et Docker Compose

## Développement local

Pour lancer l'application en mode développement:

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible à l'adresse: http://localhost:3000

## Construction pour la production

Pour construire l'application pour la production:

```bash
npm run build
```

Les fichiers générés seront disponibles dans le dossier `dist/`.

## Déploiement avec Docker

L'application peut être facilement déployée dans un conteneur Docker:

```bash
# Construction et démarrage du conteneur
docker-compose up -d --build

# Pour arrêter le conteneur
docker-compose down
```

L'application sera accessible à l'adresse: http://localhost:8080

## Structure du projet

```
saida-web/
│
├── public/            # Fichiers statiques et données GeoJSON
├── src/               # Code source
│   ├── components/    # Composants React
│   │   ├── Map/       # Composants liés à la carte
│   │   ├── Routing/   # Composants liés au calcul d'itinéraire
│   │   ├── Search/    # Composants de recherche
│   │   └── Sidebar/   # Composants de la barre latérale
│   ├── utils/         # Utilitaires
│   ├── App.tsx        # Composant racine
│   └── main.tsx       # Point d'entrée
├── Dockerfile         # Configuration Docker
├── docker-compose.yml # Configuration Docker Compose
├── nginx.conf         # Configuration Nginx pour la production
└── vite.config.ts     # Configuration Vite
```

## Technologies utilisées

- React 18
- TypeScript
- Material UI
- Leaflet
- Vite
- Docker et Nginx (pour le déploiement)

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
