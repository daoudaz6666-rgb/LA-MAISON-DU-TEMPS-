# La Maison du Temps

Site vitrine et boutique en ligne de **La Maison du Temps**, horlogerie aux 1200 Logements, Ouagadougou :
montres (Rolex, Omega, Cartier, Audemars Piguet, Hublot, Tissot, Casio, Lacoste…) et parfums pour homme, femme et enfant.

## Voir le site

Ouvrir `index.html` dans un navigateur. Aucune installation n'est nécessaire.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'entrée (tout le contenu est généré en JavaScript) |
| `css/style.css` | Design noir & or, version ordinateur, tablette et mobile |
| `js/data.js` | **Contenu modifiable** : coordonnées, produits, actualités, page « Qui sommes-nous » |
| `js/app.js` | Pages, menus, filtres, panier, favoris, commande WhatsApp |
| `js/assistant.js` | Assistant qui répond aux questions sur les montres et parfums du site |

## Modifier le contenu

Tout se fait dans `js/data.js` :

- **Coordonnées** : bloc `BOUTIQUE` (téléphone, WhatsApp, adresse, horaires).
- **Produits** : liste `PRODUITS`. Mettre `prix: 150000` pour afficher un prix et activer le panier, ou `prix: null` pour « Prix sur demande ».
- **Photos** : placer vos photos dans un dossier `images/` et écrire `image: "images/ma-photo.jpg"`.
- **Actualités** : liste `ACTUALITES`.
- **Qui sommes-nous** : bloc `A_PROPOS`.
