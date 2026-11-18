# La Maison du Temps

Site vitrine et boutique en ligne de **La Maison du Temps**, horlogerie aux 1200 Logements, Ouagadougou :
montres (Rolex, Omega, Cartier, Audemars Piguet, Hublot, Tissot, Casio, Lacoste…) et parfums pour homme, femme et enfant.

## Voir le site

Ouvrir `index.html` dans un navigateur. Aucune installation n'est nécessaire.

Les modifications faites avec Claude Code sur ce projet sont envoyées automatiquement sur GitHub à la fin de chaque réponse.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'entrée (tout le contenu est généré en JavaScript) |
| `css/style.css` | Design noir & or, version ordinateur, tablette et mobile |
| `js/data.js` | **Contenu modifiable** : coordonnées, produits, actualités, page « Qui sommes-nous » |
| `admin.html`, `js/admin.js` | Espace gestion : photos, prix et nouveaux produits |
| `js/catalogue.js` | Changements faits depuis l'espace gestion (rempli automatiquement) |
| `js/app.js` | Pages, menus, filtres, panier, favoris, commande WhatsApp |
| `js/assistant.js` | Assistant qui répond aux questions sur les montres et parfums du site |

## Espace gestion (photos et prix)

La page **`admin.html`** (https://la-maison-du-temps.vercel.app/admin.html) permet, sans toucher au code, de :
changer la photo et le prix des produits, masquer un produit, et ajouter de nouveaux produits.

- Connexion avec une **clé d'accès GitHub** (« fine-grained token ») limitée à ce dépôt, avec le droit *Contents : Read and write*.
  Pour retirer l'accès à quelqu'un : supprimer sa clé sur github.com → Settings → Developer settings → Personal access tokens.
- Les changements sont enregistrés dans `js/catalogue.js` (ne pas modifier à la main) et les photos dans `images/produits/`.
- Vercel republie le site automatiquement 1 à 2 minutes après « Publier sur le site ».

## Modifier le contenu

Tout se fait dans `js/data.js` :

- **Coordonnées** : bloc `BOUTIQUE` (téléphone, WhatsApp, adresse, horaires).
- **Produits** : liste `PRODUITS`. Mettre `prix: 150000` pour afficher un prix et activer le panier, ou `prix: null` pour « Prix sur demande ».
- **Photos** : placer vos photos dans un dossier `images/` et écrire `image: "images/ma-photo.jpg"`.
- **Actualités** : liste `ACTUALITES`.
- **Qui sommes-nous** : bloc `A_PROPOS`.
