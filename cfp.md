# Au secours ! Mes images pourrissent mes perfs

## Abstract

Les images représentent souvent plus de 50 % du poids d'une page web. Mal optimisées ou mal servies, elles deviennent un goulot d'étranglement pour les performances (notamment le LCP) et l'expérience utilisateur. Pourtant, gérer les images ne se limite pas à choisir entre JPEG, WebP ou AVIF : cela touche aussi à l'architecture du projet.

Dans ce talk, nous partagerons notre retour d'expérience sur la gestion des images dans des projets web : formats adaptés, responsive, lazy load, automatisation de l'optimisation dans la chaîne de build, mais aussi choix d'architectures pour servir efficacement les assets. Nous verrons plusieurs approches : génération statique vs dynamique, utilisation de CDN, stratégies de cache, et pipelines d'images capables de s'adapter aux différents devices.

À travers des exemples concrets et des démos, nous montrerons les pièges les plus courants et les solutions qui ont réellement fait leurs preuves en production.

Que vous soyez développeur débutant ou confirmé, vous repartirez avec des bonnes pratiques, des outils et des pistes architecturales pour transformer vos images d'ennemis invisibles de la performance… en atout majeur pour vos utilisateurs.

## Short Abstract

Les images pèsent lourd sur le web. Entre choix de formats, optimisation et architectures (CDN, cache, génération à la volée), ce talk partage démos, retour d'expérience et bonnes pratiques concrètes que vous pourrez utiliser dès demain.

## Message pour le comité

Forts de nos expériences respectives, nous avons déjà travaillé dans des contextes où l'optimisation des images dans le web est un sujet de performance prioritaire. Ayant déjà donné ensemble un talk sur Vite, Mathieu et Antoine souhaitent cette fois-ci présenter un sujet sur une des briques fondamentales du web, c'est la gestion des assets.

Nous allons proposer des architectures variées qui vont vous permettre de gérer les assets de vos applications web en fonction du nombre d'images que vous avez à délivrer.

Montrant des solutions variées qui iront de services cloud clés en main à des solutions techniques simplement self hostable.

Antoine travaillant chez Scaleway, une démo d'une infra d'optimisation d'image sera surement proposé avec les produits disponibles.

## Take Away

- Origine du support des images dans le web
- Des exemples concrets d'architecture pour servir des assets images dans le web
- Des recommandations claires dans la gestion du cache de ces assets
- Des suggestions de configuration de compression pour vos assets
- Rappel des specs sur les formats d'assets images du web
- Rappel sur les specs des balises image, picture et figure et notamment des attributs sizes / srcset

## Déroulé simplifié

### 1. Introduction

Présentation de quelques métriques sur l'almanach du web sur l'usage des assets images pour contextualiser.

### 2. Exposition du problème

Exposition de la complexité de la performance des images dans le web : format, taille d'assets responsive, cache, support navigateur, gestion de la contribution de contenu, configuration de la compression.

### 3. Solutions habituelles

Présentation des solutions habituelles pour corriger la gestion des images : format moderne, images responsives, lazy loading.

### 4. Architectures de distribution

Présentation d'architecture cloud ou locale pour la distribution et la gestion des assets images en fonction de la taille de vos projets et du nombre d'assets.

#### Exemples d'architectures selon le volume :

- **< 100 assets** : Assets dans le projet, minifiés / optimisés localement par des outils type sharp
- **~1000 assets** : Assets dans des git lfs
- **> 1000 assets** : Déploiement d'un service image ou usage d'un outil de service image at edge
- **Démo** : Service self hosté dans un cloud souverain
