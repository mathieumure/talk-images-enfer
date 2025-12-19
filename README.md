# Talk Images

Projet de conférence autour de la thématique des images.

## 📋 Description

Ce projet présente une conférence dédiée à l'exploration et à la manipulation d'images, couvrant les aspects techniques, artistiques et pratiques du traitement d'images.

Cette présentation utilise [Reveal.js](https://revealjs.com) et [Astro](https://astro.build) pour créer des slides modernes et interactives sur le web.

## 🚀 Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- pnpm (recommandé) ou npm/yarn

### Installation des dépendances

```bash
# Avec pnpm (recommandé)
pnpm install

# Ou avec npm
npm install

# Ou avec yarn
yarn install
```

## 📖 Utilisation

### Mode développement

Lancez le serveur de développement pour prévisualiser votre présentation :

```bash
pnpm dev
# ou
npm run dev
```

La présentation sera accessible à l'adresse `http://localhost:4321`

### Build de production

Pour créer une version optimisée de votre présentation :

```bash
pnpm build
# ou
npm run build
```

### Prévisualisation du build

Pour prévisualiser la version de production :

```bash
pnpm preview
# ou
npm run preview
```

## 📁 Structure du projet

```
talk-images/
├── public/              # Fichiers statiques (images, favicon, etc.)
├── src/
│   ├── pages/
│   │   └── index.astro  # Page principale avec les slides
│   └── styles/
│       └── global.css   # Styles globaux
├── .github/
│   └── workflows/       # GitHub Actions pour le déploiement
├── astro.config.mjs     # Configuration Astro
├── package.json         # Dépendances du projet
└── tsconfig.json        # Configuration TypeScript
```

## 🛠️ Technologies utilisées

- **[Astro](https://astro.build)** - Framework web moderne
- **[Reveal.js](https://revealjs.com)** - Framework de présentation HTML
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique pour JavaScript

## 📝 Personnalisation

### Ajouter des slides

Modifiez le fichier `src/pages/index.astro` pour ajouter vos slides. Chaque section `<section>` représente une slide.

### Changer le thème

Modifiez le fichier `src/styles/global.css` pour changer le thème Reveal.js. Les thèmes disponibles incluent :
- `white` (par défaut)
- `black`
- `league`
- `beige`
- `sky`
- `night`
- `serif`
- `simple`
- `solarized`
- `blood`
- `moon`

### Ajouter des frameworks UI

Si vous avez besoin d'un framework UI spécifique, vous pouvez l'ajouter avec Astro :

```bash
# Exemple avec Svelte
pnpm astro add svelte

# Exemple avec React et Tailwind
pnpm astro add react tailwind
```

## 🚀 Déploiement

Ce projet inclut un workflow GitHub Actions pour déployer automatiquement sur GitHub Pages à chaque push sur la branche `main`.

Pour activer le déploiement :
1. Allez dans les paramètres de votre repository GitHub
2. Activez GitHub Pages dans la section "Pages"
3. Sélectionnez "GitHub Actions" comme source

## 📝 Contenu de la conférence

- Introduction aux images
- Traitement et manipulation
- Cas d'usage pratiques
- Conclusion

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

[Spécifiez la licence du projet]

## 👤 Auteur

[Votre nom]

## 📧 Contact

[Vos coordonnées de contact]

## 🙏 Remerciements

Ce projet est basé sur le template [slides-template](https://github.com/jsulpis/slides-template) de [jsulpis](https://github.com/jsulpis).

