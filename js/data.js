// ===============================================
//  LA MAISON DU TEMPS — Catalogue produits
//
//  Pour ajouter un produit : copier un bloc { ... } et modifier les valeurs.
//    type   : "montre" | "parfum" | "bracelet"
//    genre  : "homme" | "femme" | "mixte" (homme & femme, couple) | "enfant"
//    gamme  : "prestige" | "marque"  (montres uniquement, comme sur l'affiche)
//    marque : nom de la marque (sert au filtre « Marques »)
//    prix   : en FCFA, ex. 150000  — ou null pour afficher « Prix sur demande »
//             (avec un prix, le bouton « Ajouter au panier » apparaît)
//    image  : IMG("id-unsplash")  ou  "images/ma-photo.jpg" pour vos propres photos
//             (créez un dossier « images » à côté de index.html)
//    illustration : true si la photo n'est pas le vrai modèle vendu
// ===============================================

const IMG = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${w}&fit=crop&auto=format&q=80`;

const BANNER = (id, w = 1800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&q=80`;

const BOUTIQUE = {
  nom: "La Maison du Temps",
  slogan: "L'excellence à chaque seconde",
  devise: "FCFA",
  whatsapp: "22661216062", // numéro WhatsApp (indicatif 226 sans +, sans espaces)
  whatsappAffiche: "+226 61 21 60 62", // numéro WhatsApp tel qu'il s'affiche sur le site
  email: "contact@lamaisondutemps.com", // ← remplacer par votre vraie adresse e-mail
  telephone: "+226 74 18 17 13",
  snapchat: "president_vampa",
  adresse: "1200 Logements, Ouagadougou 01",
  boitePostale: "01 BP 6829 Ouagadougou 01",
  horaires: "Ouvert tous les jours · Ferme à 20h00",
  pluscode: "9G74+G9C Ouagadougou",
  carte: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("La Maison du Temps 9G74+G9C Ouagadougou"),
  carteEmbed: "https://maps.google.com/maps?q=" + encodeURIComponent("9G74+G9C Ouagadougou") + "&z=16&output=embed",
  livraisonGratuiteDes: 100000,
};

const IMAGES = {
  hero: BANNER("1533139502658-0198f920d8e8"),
  homme: BANNER("1555529669-e69e7aa0ba9a", 1000),
  femme: BANNER("1524592094714-0f0654e20314", 1000),
  enfant: BANNER("1471286174890-9c112ffca5b4", 1000),
  mixte: BANNER("1604242692760-2f7b0c26856d", 1000),
  bracelets: BANNER("1611591437281-460bfbe1220a", 1000),
  montres: BANNER("1604242692760-2f7b0c26856d", 1200),
  parfums: BANNER("1615634260167-c8cdede054de", 1200),
};

const PRODUITS = [
  // ================= MONTRES DE PRESTIGE (affiche) =================
  { id: 1, nom: "Patek Philippe Genève", marque: "Patek Philippe", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1495857000853-fe46c8aefc30"), illustration: true, badge: "Prestige", note: 5,
    description: "L'élégance genevoise par excellence : un cadran épuré et des finitions d'exception.",
    details: ["Marque : Patek Philippe", "Collection : Genève", "Style habillé", "Disponible en boutique"] },
  { id: 2, nom: "Patek Philippe Nautilus", marque: "Patek Philippe", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1557531365-e8b22d93dbd0"), illustration: true, badge: "Iconique", note: 5,
    description: "Le chic sportif ultime, avec son boîtier aux lignes douces et son cadran horizontal.",
    details: ["Marque : Patek Philippe", "Modèle : Nautilus", "Bracelet intégré", "Disponible en boutique"] },
  { id: 3, nom: "Rolex Submariner", marque: "Rolex", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1594534475808-b18fc33b045e"), badge: "Best-seller", note: 5,
    description: "La montre de plongée emblématique : lunette tournante, cadran noir et bracelet acier.",
    details: ["Marque : Rolex", "Modèle : Submariner", "Bracelet acier", "Disponible en boutique"] },
  { id: 4, nom: "Rolex Day-Date", marque: "Rolex", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1600003014755-ba31aa59c4b6"), illustration: true, badge: "Prestige", note: 4.9,
    description: "La montre des présidents : jour et date affichés en toutes lettres, lunette cannelée.",
    details: ["Marque : Rolex", "Modèle : Day-Date", "Affichage jour et date", "Disponible en boutique"] },
  { id: 5, nom: "Audemars Piguet Squelette", marque: "Audemars Piguet", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1609587312208-cea54be969e7"), illustration: true, badge: "Exception", note: 4.9,
    description: "Un cadran ajouré qui dévoile le mouvement : la haute horlogerie mise à nu.",
    details: ["Marque : Audemars Piguet", "Cadran squelette", "Lunette octogonale", "Disponible en boutique"] },
  { id: 6, nom: "Audemars Piguet Automatique", marque: "Audemars Piguet", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1539874754764-5a96559165b0"), illustration: true, note: 4.9,
    description: "La signature Audemars Piguet et son mouvement automatique, pour un style affirmé.",
    details: ["Marque : Audemars Piguet", "Mouvement automatique", "Lunette octogonale", "Disponible en boutique"] },
  { id: 7, nom: "Cartier Santos", marque: "Cartier", gamme: "prestige", type: "montre", genre: "mixte", prix: null,
    image: IMG("1518131672697-613becd4fab5"), illustration: true, badge: "Coup de cœur", note: 4.9,
    description: "Le boîtier carré et les vis apparentes d'une légende de l'élégance. Pour elle comme pour lui.",
    details: ["Marque : Cartier", "Modèle : Santos", "Boîtier carré", "Disponible en boutique"] },
  { id: 8, nom: "Cartier Santos-Dumont", marque: "Cartier", gamme: "prestige", type: "montre", genre: "mixte", prix: null,
    image: IMG("1524592094714-0f0654e20314"), illustration: true, note: 4.8,
    description: "La version fine et raffinée de la Santos, au style intemporel.",
    details: ["Marque : Cartier", "Modèle : Santos-Dumont", "Boîtier fin", "Disponible en boutique"] },
  { id: 9, nom: "Omega Speedmaster", marque: "Omega", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1548171915-e79a380a2a4b"), illustration: true, note: 4.9,
    description: "Le chronographe légendaire, symbole de précision et d'aventure.",
    details: ["Marque : Omega", "Modèle : Speedmaster", "Chronographe", "Disponible en boutique"] },
  { id: 10, nom: "Richard Mille", marque: "Richard Mille", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1612817159949-195b6eb9e31a"), illustration: true, badge: "Exception", note: 4.8,
    description: "Boîtier tonneau et design squelette : une montre audacieuse et ultra-moderne.",
    details: ["Marque : Richard Mille", "Boîtier tonneau", "Bracelet caoutchouc", "Disponible en boutique"] },
  { id: 11, nom: "Hublot", marque: "Hublot", gamme: "prestige", type: "montre", genre: "homme", prix: null,
    image: IMG("1547996160-81dfa63595aa"), illustration: true, note: 4.8,
    description: "L'art de la fusion : des matières audacieuses et un caractère puissant.",
    details: ["Marque : Hublot", "Design sportif", "Plusieurs modèles", "Disponible en boutique"] },

  // ================= MONTRES DE MARQUE (affiche) =================
  { id: 12, nom: "Montblanc", marque: "Montblanc", gamme: "marque", type: "montre", genre: "homme", prix: null,
    image: IMG("1557531365-e8b22d93dbd0"), illustration: true, note: 4.8,
    description: "L'élégance classique de la maison Montblanc, pour un style raffiné au quotidien.",
    details: ["Marque : Montblanc", "Style classique", "Plusieurs modèles", "Disponible en boutique"] },
  { id: 13, nom: "Hugo Boss", marque: "Hugo Boss", gamme: "marque", type: "montre", genre: "homme", prix: null,
    image: IMG("1533139502658-0198f920d8e8"), illustration: true, badge: "Tendance", note: 4.7,
    description: "Une montre élégante et masculine, parfaite au bureau comme en soirée.",
    details: ["Marque : Hugo Boss", "Style habillé", "Plusieurs coloris", "Disponible en boutique"] },
  { id: 14, nom: "Emporio Armani", marque: "Emporio Armani", gamme: "marque", type: "montre", genre: "mixte", prix: null,
    image: IMG("1542496658-e33a6d0d50f6"), illustration: true, note: 4.7,
    description: "Le style italien au poignet : design moderne et finitions soignées.",
    details: ["Marque : Emporio Armani", "Style mode", "Homme & femme", "Disponible en boutique"] },
  { id: 15, nom: "Tissot", marque: "Tissot", gamme: "marque", type: "montre", genre: "mixte", prix: null,
    image: IMG("1585123334904-845d60e97b29"), illustration: true, badge: "Tendance", note: 4.8,
    description: "Le savoir-faire suisse accessible, avec des modèles classiques et sportifs.",
    details: ["Marque : Tissot", "Savoir-faire suisse", "Plusieurs modèles", "Disponible en boutique"] },
  { id: 16, nom: "Daniel Wellington", marque: "Daniel Wellington", gamme: "marque", type: "montre", genre: "femme", prix: null,
    image: IMG("1508057198894-247b23fe5ade"), illustration: true, badge: "Best-seller", note: 4.8,
    description: "Le minimalisme scandinave : cadran épuré et finesse, idéal en cadeau.",
    details: ["Marque : Daniel Wellington", "Style minimaliste", "Boîtier fin", "Disponible en boutique"] },
  { id: 17, nom: "Casio", marque: "Casio", gamme: "marque", type: "montre", genre: "mixte", prix: null,
    image: IMG("1617043786394-f977fa12eddf"), illustration: true, note: 4.7,
    description: "Fiables et robustes : des montres pour tous les jours, digitales ou analogiques.",
    details: ["Marque : Casio", "Robuste", "Plusieurs modèles", "Disponible en boutique"] },
  { id: 18, nom: "Poedagar", marque: "Poedagar", gamme: "marque", type: "montre", genre: "homme", prix: null,
    image: IMG("1547996160-81dfa63595aa"), illustration: true, note: 4.5,
    description: "Un look luxe et habillé, avec date et finitions brillantes.",
    details: ["Marque : Poedagar", "Guichet date", "Bon rapport qualité-prix", "Disponible en boutique"] },
  { id: 19, nom: "Curren", marque: "Curren", gamme: "marque", type: "montre", genre: "homme", prix: null,
    image: IMG("1539874754764-5a96559165b0"), illustration: true, note: 4.5,
    description: "Une montre robuste au look affirmé, à petit prix.",
    details: ["Marque : Curren", "Chronographe", "Bon rapport qualité-prix", "Disponible en boutique"] },
  { id: 20, nom: "Tomi", marque: "Tomi", gamme: "marque", type: "montre", genre: "mixte", prix: null,
    image: IMG("1612817159949-195b6eb9e31a"), illustration: true, note: 4.4,
    description: "Des montres mode et colorées, pour toutes les occasions.",
    details: ["Marque : Tomi", "Style mode", "Plusieurs coloris", "Disponible en boutique"] },
  { id: 21, nom: "Hanboro", marque: "Hanboro", gamme: "marque", type: "montre", genre: "homme", prix: null,
    image: IMG("1495857000853-fe46c8aefc30"), illustration: true, note: 4.4,
    description: "Un design soigné et un excellent rapport qualité-prix.",
    details: ["Marque : Hanboro", "Style classique", "Bon rapport qualité-prix", "Disponible en boutique"] },
  { id: 22, nom: "Montre Duo", marque: "Montre Duo", gamme: "marque", type: "montre", genre: "mixte", prix: null,
    image: IMG("1604242692760-2f7b0c26856d"), illustration: true, badge: "Idée cadeau", note: 4.8,
    description: "Deux montres assorties pour lui et pour elle : le cadeau idéal pour les couples.",
    details: ["Coffret de 2 montres", "Pour couple", "Idée cadeau", "Disponible en boutique"] },

  // ================= BRACELETS =================
  { id: 23, nom: "Bracelets", marque: "Bracelets", type: "bracelet", genre: "mixte", prix: null,
    image: IMG("1611591437281-460bfbe1220a"), illustration: true, badge: "Style & raffinement", note: 4.7,
    description: "Notre sélection de bracelets pour homme et femme, à porter seuls ou avec votre montre.",
    details: ["Homme & femme", "Plusieurs modèles", "Idée cadeau", "Disponible en boutique"] },

  // ================= PARFUMS =================
  // ← Remplacez ces exemples par les parfums que vous vendez réellement
  { id: 24, nom: "Parfum Homme — Boisé", marque: "Parfums", type: "parfum", genre: "homme", prix: null,
    image: IMG("1622618991746-fe6004db3a47"), badge: "Signature & élégance", note: 4.8,
    description: "Notre sélection de parfums homme aux notes boisées et orientales. Demandez-nous les références disponibles.",
    details: ["Parfum homme", "Notes boisées / orientales", "Plusieurs contenances", "Disponible en boutique"] },
  { id: 25, nom: "Parfum Homme — Frais", marque: "Parfums", type: "parfum", genre: "homme", prix: null,
    image: IMG("1557827983-012eb6ea8dc1"), note: 4.7,
    description: "Des fragrances fraîches et légères pour tous les jours.",
    details: ["Parfum homme", "Notes fraîches", "Plusieurs contenances", "Disponible en boutique"] },
  { id: 26, nom: "Parfum Femme — Floral", marque: "Parfums", type: "parfum", genre: "femme", prix: null,
    image: IMG("1588405748880-12d1d2a59f75"), badge: "Signature & élégance", note: 4.9,
    description: "Notre sélection de parfums femme aux notes florales et poudrées.",
    details: ["Parfum femme", "Notes florales", "Plusieurs contenances", "Disponible en boutique"] },
  { id: 27, nom: "Parfum Femme — Gourmand", marque: "Parfums", type: "parfum", genre: "femme", prix: null,
    image: IMG("1557170334-a9632e77c6e4"), note: 4.8,
    description: "Des fragrances douces et gourmandes : vanille, fruits, musc.",
    details: ["Parfum femme", "Notes gourmandes", "Plusieurs contenances", "Disponible en boutique"] },
  { id: 28, nom: "Coffrets Parfum", marque: "Parfums", type: "parfum", genre: "mixte", prix: null,
    image: IMG("1615634260167-c8cdede054de"), badge: "Idée cadeau", note: 4.7,
    description: "Des coffrets prêts à offrir pour toutes les occasions.",
    details: ["Coffret cadeau", "Homme & femme", "Emballage soigné", "Disponible en boutique"] },
  { id: 29, nom: "Eau de senteur Enfant", marque: "Parfums", type: "parfum", genre: "enfant", prix: null,
    image: IMG("1608571423902-eed4a5ad8108"), note: 4.7,
    description: "Des senteurs douces et légères adaptées aux enfants.",
    details: ["Pour enfant", "Senteur douce", "Format adapté", "Disponible en boutique"] },
];

// ===============================================
//  ACTUALITÉS
//  Pour publier une actualité : copier un bloc { ... } en haut de la liste.
//    date      : "AAAA-MM-JJ" (les plus récentes s'affichent en premier)
//    image     : IMG("id-unsplash") ou "images/ma-photo.jpg"
//    contenu   : un paragraphe par ligne entre guillemets
//    lien      : bouton facultatif { texte: "...", url: "#/boutique?..." }
// ===============================================
const ACTUALITES = [
  { id: 4, date: "2026-11-15", categorie: "Idées cadeaux",
    titre: "Fêtes de fin d'année : offrez l'art du temps",
    image: IMG("1604242692760-2f7b0c26856d"),
    resume: "Montres, bracelets et parfums : trouvez le cadeau parfait pour homme, femme et enfant.",
    contenu: [
      "Les fêtes approchent ! Une montre ou un parfum, c'est un cadeau qui marque et qui dure.",
      "Venez découvrir notre sélection en boutique aux 1200 Logements : Patek Philippe, Rolex, Audemars Piguet, Cartier, Omega, Montblanc, Tissot, Daniel Wellington et bien d'autres.",
      "Nous vous conseillons selon votre budget, et l'emballage cadeau est possible sur demande.",
    ],
    lien: { texte: "Voir les montres", url: "#/boutique?type=montre" } },

  { id: 3, date: "2026-10-20", categorie: "Nouvel arrivage",
    titre: "Nouvel arrivage : Cartier Santos et Omega",
    image: IMG("1548171915-e79a380a2a4b"),
    resume: "De nouveaux modèles viennent d'arriver en boutique. Passez les découvrir !",
    contenu: [
      "De nouveaux modèles Cartier Santos et Omega viennent d'arriver à La Maison du Temps.",
      "Les quantités sont limitées : contactez-nous sur WhatsApp ou passez en boutique pour les voir et les essayer.",
    ],
    lien: { texte: "Voir la Cartier Santos", url: "#/boutique?marque=Cartier" } },

  { id: 2, date: "2026-09-10", categorie: "Parfums",
    titre: "Parfums disponibles en boutique",
    image: IMG("1615634260167-c8cdede054de"),
    resume: "En plus des montres, retrouvez notre sélection de parfums pour homme, femme et enfant.",
    contenu: [
      "La Maison du Temps, ce sont aussi des parfums ! Fragrances boisées, florales, fraîches ou gourmandes : il y en a pour tous les goûts.",
      "Demandez-nous la liste des références disponibles sur WhatsApp.",
    ],
    lien: { texte: "Voir les parfums", url: "#/boutique?type=parfum" } },

  { id: 1, date: "2026-08-01", categorie: "La boutique",
    titre: "Bienvenue à La Maison du Temps",
    image: IMG("1557531365-e8b22d93dbd0"),
    resume: "Votre horlogerie aux 1200 Logements, à Ouagadougou. Ouvert tous les jours jusqu'à 20h.",
    contenu: [
      "La Maison du Temps vous accueille aux 1200 Logements, à Ouagadougou, tous les jours jusqu'à 20h00.",
      "Montres de prestige, montres de marque, parfums et bracelets : venez découvrir notre collection et profiter de nos conseils.",
      "Vous pouvez aussi nous appeler au +226 74 18 17 13 ou nous écrire sur WhatsApp au +226 61 21 60 62.",
    ],
    lien: { texte: "Itinéraire Google Maps", url: BOUTIQUE.carte } },
];

// ===============================================
//  QUI SOMMES-NOUS
//  Modifiez librement ces textes pour raconter votre histoire
//  (année d'ouverture, fondateur, anecdotes…).
//  icone possible : "horloge", "repere", "tel", "cadeau", "bouclier", "camion", "paiement", "check"
// ===============================================
const A_PROPOS = {
  banniere: BANNER("1533139502658-0198f920d8e8", 1600),
  image: IMG("1604242692760-2f7b0c26856d", 1000), // ← idéalement une photo de votre boutique : "images/boutique.jpg"
  surTitre: "Notre histoire",
  titre: "La Maison du Temps, l'art du temps à Ouagadougou",
  histoire: [
    "La Maison du Temps est une horlogerie située aux 1200 Logements, à Ouagadougou. Notre passion : vous faire découvrir de belles montres et des parfums qui vous ressemblent.",
    "Des montres de prestige comme Patek Philippe, Rolex, Audemars Piguet, Cartier, Omega, Richard Mille ou Hublot aux montres de marque comme Montblanc, Hugo Boss, Emporio Armani, Tissot ou Daniel Wellington, sans oublier nos parfums et nos bracelets : il y en a pour tous les styles et toutes les occasions.",
    "Parce qu'une montre ou un parfum se choisit aussi avec le cœur, nous prenons le temps de vous conseiller, en boutique comme sur WhatsApp.",
  ],
  engagements: [
    { icone: "horloge", titre: "Le conseil avant tout", texte: "Nous vous aidons à trouver le modèle qui correspond à votre style, à l'occasion et à votre budget." },
    { icone: "check", titre: "Un large choix", texte: "Montres de prestige, montres de marque, parfums et bracelets : il y en a pour tous les goûts." },
    { icone: "cadeau", titre: "L'art d'offrir", texte: "Fêtes, anniversaires, Saint-Valentin : nous vous accompagnons pour trouver le cadeau parfait." },
    { icone: "repere", titre: "Proches de vous", texte: "Une boutique ouverte tous les jours aux 1200 Logements, et une équipe joignable sur WhatsApp." },
  ],
};
