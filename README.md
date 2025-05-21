<!-- PROJECT SHIELDS -->

<br />
<div align="center">
  <h3 align="center">SAIDA Web - Système d'Analyse et d'Information des Données d'Aménagement</h3>
  <p align="center">
    Application cartographique moderne pour explorer et visualiser les infrastructures et services de la ville d'Ebolowa.
    <br />
    <a href="#"><strong>Explorer la documentation »</strong></a>
    <br />
    <br />
    <a href="#">Voir la démo</a>
    ·
    <a href="#">Signaler un bug</a>
    ·
    <a href="#">Demander une fonctionnalité</a>
  </p>
</div>

<details>
  <summary>Table des matières</summary>
  <ol>
    <li>
      <a href="#about-the-project">À propos du projet</a>
      <ul>
        <li><a href="#built-with">Technologies utilisées</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Bien démarrer</a>
      <ul>
        <li><a href="#prerequisites">Prérequis</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Utilisation</a></li>
    <li><a href="#project-structure">Structure du projet</a></li>
    <li><a href="#roadmap">Feuille de route</a></li>
    <li><a href="#contributing">Contribuer</a></li>
    <li><a href="#license">Licence</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Remerciements</a></li>
  </ol>
</details>

---

## À propos du projet

SAIDA (Système d'Analyse et d'Information des Données d'Aménagement) est une application web de cartographie interactive pour la ville d'Ebolowa. Elle permet d'explorer, d'analyser et de visualiser les infrastructures, services et données géospatiales de la ville.

**Fonctionnalités principales :**

- Affichage et gestion de multiples couches cartographiques (GeoJSON)
- Calcul d'itinéraires entre points d'intérêt
- Outils de dessin avec persistance locale (formes sauvegardées même après rechargement)
- Légende interactive et rétractable
- Recherche d'adresses et de lieux
- Interface utilisateur moderne et réactive
- Déploiement facile via Docker

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

### Technologies utilisées

- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI](https://mui.com/)
- [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- [Turf.js](https://turfjs.org/) (opérations géospatiales)
- [Vite](https://vitejs.dev/)
- [Docker](https://www.docker.com/) & [Nginx](https://nginx.org/)

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

## Bien démarrer

### Prérequis

- Node.js 18.x ou supérieur
- npm 8.x ou supérieur
- Docker & Docker Compose (pour le déploiement)

### Installation

1. Clonez le dépôt :
   ```sh
   git clone https://github.com/votre_utilisateur/saida-web.git
   cd saida-web
   ```
2. Installez les dépendances :
   ```sh
   npm install
   ```
3. Lancez le serveur de développement :
   ```sh
   npm run dev
   ```
   L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

### Déploiement Docker

```sh
docker-compose up -d --build
```

L'application sera accessible sur [http://localhost:8080](http://localhost:8080).

#### Autres méthodes de déploiement Docker

Vous pouvez également déployer l'application de plusieurs façons selon vos besoins :

1. **Avec le script build.sh**

   Ce script automatise la construction et le lancement du conteneur :

   ```sh
   ./build.sh
   ```

   L'application sera accessible sur [http://localhost:8080](http://localhost:8080) (ou le port défini dans le script).

2. **Manuellement avec Docker**

   Étape 1 : Construisez l'image Docker

   ```sh
   docker build -t saida-web .
   ```

   Étape 2 : Lancez le conteneur

   ```sh
   docker run -d --name saida-web-app -p 8080:80 saida-web
   ```

   L'application sera accessible sur [http://localhost:8080](http://localhost:8080).

3. **Personnalisation des volumes de données**

   Pour monter vos propres fichiers GeoJSON ou données statiques, vous pouvez utiliser l'option `-v` lors du lancement du conteneur :

   ```sh
   docker run -d --name saida-web-app -p 8080:80 -v $(pwd)/public/data:/usr/share/nginx/html/data saida-web
   ```

   Cela permet de garder vos données synchronisées avec le conteneur.

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

## Utilisation

- Utilisez la carte pour explorer les différentes couches (bâtiments, routes, services, etc.).
- Dessinez des formes pour marquer des zones d'intérêt (les formes sont sauvegardées localement).
- Utilisez la barre latérale pour rechercher des lieux ou calculer des itinéraires.
- La légende peut être repliée/dépliée pour plus de clarté.

**Exemple de données :**
Des fichiers GeoJSON sont disponibles dans `public/data/` (ex : `batiments.geojson`, `hopital.geojson`, etc.).

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

## Structure du projet

```
saida-web/
│
├── public/                # Fichiers statiques et données GeoJSON
│   ├── data/              # Données géospatiales (GeoJSON)
│   └── geojson_data/      # (optionnel) Autres données GeoJSON
├── src/                   # Code source principal
│   ├── assets/            # Images et icônes
│   ├── components/        # Composants React
│   │   ├── Map/           # Carte et outils associés
│   │   │   ├── Map.tsx
│   │   │   ├── GeoJsonLayers.tsx
│   │   │   ├── DrawTools.tsx
│   │   │   ├── Legend.tsx
│   │   │   └── SearchMarker.tsx
│   │   ├── Sidebar/       # Barre latérale et panneaux
│   │   │   ├── Sidebar.tsx
│   │   │   └── DrawingPanel.tsx
│   │   ├── Routing/       # Calcul d'itinéraires
│   │   │   ├── RoutingPanel.tsx
│   │   │   └── RoutingControl.tsx
│   │   ├── Search/        # Recherche
│   │   │   └── MapSearch.tsx
│   │   └── UI/            # (Réservé pour composants UI génériques)
│   ├── styles/            # Fichiers de style (CSS)
│   ├── utils/             # Fonctions utilitaires
│   │   ├── geoJsonLoader.ts
│   │   ├── routingService.ts
│   │   └── layerConfigs.ts
│   ├── App.tsx            # Composant racine
│   └── main.tsx           # Point d'entrée
├── Dockerfile             # Configuration Docker
├── docker-compose.yml     # Configuration Docker Compose
├── nginx.conf             # Configuration Nginx pour la production
├── vite.config.ts         # Configuration Vite
└── README.md              # Ce fichier
```

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

## Feuille de route

- [x] Persistance des formes dessinées
- [x] Légende interactive et rétractable
- [x] Conteneurisation avec Docker
- [ ] Authentification utilisateur
- [ ] Export des données dessinées
- [ ] Support mobile amélioré

Voir les [issues ouvertes](#) pour la liste complète.

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

## Contribuer

Les contributions sont ce qui fait de la communauté open source un endroit incroyable pour apprendre, inspirer et créer. Toute contribution est **appréciée** !

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

## Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

## Contact

Votre Nom - [@votre_twitter](https://twitter.com/votre_username) - email@example.com  
Lien du projet : [https://github.com/votre_utilisateur/saida-web](https://github.com/votre_utilisateur/saida-web)

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

## Remerciements

- [Choose an Open Source License](https://choosealicense.com)
- [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
- [Malven's Flexbox Cheatsheet](https://flexbox.malven.co/)
- [Img Shields](https://shields.io)
- [Font Awesome](https://fontawesome.com)
- [React Icons](https://react-icons.github.io/react-icons/search)

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/votre_utilisateur/saida-web.svg?style=for-the-badge
[contributors-url]: https://github.com/votre_utilisateur/saida-web/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/votre_utilisateur/saida-web.svg?style=for-the-badge
[forks-url]: https://github.com/votre_utilisateur/saida-web/network/members
[stars-shield]: https://img.shields.io/github/stars/votre_utilisateur/saida-web.svg?style=for-the-badge
[stars-url]: https://github.com/votre_utilisateur/saida-web/stargazers
[issues-shield]: https://img.shields.io/github/issues/votre_utilisateur/saida-web.svg?style=for-the-badge
[issues-url]: https://github.com/votre_utilisateur/saida-web/issues
[license-shield]: https://img.shields.io/github/license/votre_utilisateur/saida-web.svg?style=for-the-badge
[license-url]: https://github.com/votre_utilisateur/saida-web/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/votre_profil
[product-screenshot]: src/assets/react.svg
