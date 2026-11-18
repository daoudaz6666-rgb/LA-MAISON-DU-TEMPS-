// ===============================================
//  LA MAISON DU TEMPS — Assistant (100 % JavaScript)
//
//  Répond UNIQUEMENT aux questions sur les montres et parfums du site
//  (marques, modèles, prix, idées cadeaux) et sur la boutique
//  (adresse, horaires, contact). Toute autre question est refusée.
//  Les réponses viennent directement du catalogue (js/data.js) :
//  l'assistant n'invente jamais un produit ni un prix.
// ===============================================

(() => {
  "use strict";

  // ---------- Utilitaires ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => " " + String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, " ").replace(/[^a-z0-9+ ]/g, " ").replace(/\s+/g, " ").trim() + " ";
  const fmt = (n) => n.toLocaleString("fr-FR").replace(/ | /g, " ") + " " + BOUTIQUE.devise;
  const aPrix = (p) => typeof p.prix === "number" && p.prix > 0;
  const lienWa = (txt) => `https://wa.me/${BOUTIQUE.whatsapp}?text=${encodeURIComponent(txt)}`;
  const tel = BOUTIQUE.telephone.replace(/\s/g, "");
  // Le texte contient-il l'un des mots/expressions (mots entiers) ?
  const contient = (t, mots) => mots.some((m) => t.includes(` ${m} `));


  // ---------- Vocabulaire ----------
  // Alias de chaque marque du catalogue (mots entiers, sans accents)
  const ALIAS = {
    // Montres de prestige
    "Patek Philippe": ["patek", "philippe", "patek philippe", "nautilus", "geneve", "calatrava"],
    "Rolex": ["rolex", "submariner", "day date", "daydate", "president"],
    "Audemars Piguet": ["audemars", "piguet", "royal oak", "ap", "squelette", "squeletton", "skeleton"],
    "Cartier": ["cartier", "santos", "dumont", "santos dumont"],
    "Omega": ["omega", "speedmaster"],
    "Richard Mille": ["richard mille", "richard", "rm"],
    "Hublot": ["hublot", "big bang"],
    // Montres de marque
    "Montblanc": ["montblanc", "mont blanc"],
    "Hugo Boss": ["boss", "hugo boss", "hugo"],
    "Emporio Armani": ["armani", "emporio armani", "emporio"],
    "Tissot": ["tissot", "prx"],
    "Daniel Wellington": ["daniel wellington", "wellington", "dw"],
    "Casio": ["casio", "edifice", "g shock", "gshock"],
    "Poedagar": ["poedagar", "poedager", "poedaga"],
    "Curren": ["curren"],
    "Tomi": ["tomi"],
    "Hanboro": ["hanboro"],
    "Montre Duo": ["montre duo", "duo", "couple", "montres couple", "montre couple", "pour nous deux"],
  };
  // Gammes (comme sur l'affiche)
  const GAMMES = {
    prestige: ["prestige", "luxe", "haut de gamme", "haute horlogerie", "grande marque", "grandes marques"],
    marque: ["montres de marque", "montre de marque", "abordable", "abordables", "petit prix", "pas cher", "moins cher", "economique"],
  };
  // Marques connues que la boutique n'a pas sur le site
  const AUTRES_MARQUES = ["seiko", "citizen", "fossil", "michael kors", "mk", "guess", "swatch", "lacoste", "tommy", "tommy hilfiger", "shenxi",
    "breitling", "tag heuer", "longines", "apple watch", "samsung", "huawei", "invicta", "naviforce", "skmei", "festina",
    "chanel", "dior", "gucci", "versace", "ysl", "saint laurent", "lancome", "hermes", "prada", "paco rabanne",
    "creed", "tom ford", "jean paul gaultier", "givenchy", "bvlgari", "bulgari", "calvin klein", "azzaro",
    "carolina herrera", "boucheron", "kenzo", "lattafa", "rasasi", "ajmal", "oud"];
  const GENRES = {
    homme: ["homme", "hommes", "monsieur", "messieurs", "mari", "papa", "pere", "pour lui", "masculin", "masculine", "copain", "fiance", "frere", "mec", "gars"],
    femme: ["femme", "femmes", "dame", "dames", "madame", "epouse", "maman", "mere", "pour elle", "feminin", "feminine", "copine", "fiancee", "soeur", "cherie"],
    mixte: ["mixte", "unisexe", "unisex", "pour les deux"],
    enfant: ["enfant", "enfants", "fils", "fille", "garcon", "bebe", "ado", "ados", "adolescent", "adolescente", "junior", "kid", "kids", "gamin", "gamins"],
  };
  const TYPES = {
    montre: ["montre", "montres", "watch", "horlogerie", "chrono", "chronographe", "connectee", "connectees", "smartwatch"],
    parfum: ["parfum", "parfums", "fragrance", "fragrances", "senteur", "senteurs", "eau de parfum", "eau de toilette", "odeur", "coffret", "coffrets"],
    bracelet: ["bracelet", "bracelets", "gourmette"],
  };
  const INTENTIONS = {
    salut: ["bonjour", "bonsoir", "salut", "hello", "coucou", "slt", "bjr", "hi", "hey", "yo", "cc"],
    merci: ["merci", "thanks", "super", "parfait", "genial", "top", "ok merci"],
    horaires: ["horaire", "horaires", "heure", "heures", "ouvert", "ouverte", "ouverture", "ferme", "fermeture", "dimanche", "aujourd hui"],
    adresse: ["adresse", "situe", "situee", "localisation", "localiser", "itineraire", "plan", "maps", "venir", "trouver la boutique", "ou etes vous", "ou se trouve", "magasin", "boutique physique", "quartier",
      "et ou", "ou est", "c est ou", "ou etes", "ou vous trouver", "ou se situe", "ou vous etes", "vous etes ou"],
    contact: ["telephone", "tel", "numero", "appeler", "appel", "contact", "contacter", "joindre", "whatsapp", "wa", "snap", "snapchat", "reseaux", "reseaux sociaux", "instagram", "insta", "facebook", "fb", "email", "mail", "e mail"],
    livraison: ["livraison", "livrer", "livrez", "livre", "expedition", "expedier", "envoyer", "envoi"],
    paiement: ["paiement", "payer", "paye", "orange money", "moov", "moov money", "mobile money", "especes", "carte bancaire"],
    prix: ["prix", "combien", "cout", "coute", "coutent", "tarif", "tarifs", "cher", "budget", "fcfa", "francs", "moins cher", "pas cher"],
    cadeau: ["cadeau", "cadeaux", "offrir", "saint valentin", "valentin", "anniversaire", "fete", "fetes", "noel", "tabaski", "ramadan", "mariage", "surprise"],
    marques: ["marque", "marques", "quelles marques", "quelle marque"],
    catalogue: ["catalogue", "collection", "collections", "modele", "modeles", "article", "articles", "produit", "produits", "disponible", "disponibles", "dispo", "stock", "avez vous", "vous avez", "vendez", "nouveaute", "nouveautes", "nouveau", "arrivage"],
    authenticite: ["original", "originale", "originaux", "authentique", "authenticite", "vrai", "vraie", "copie", "replique", "contrefacon", "garantie", "certificat"],
  };

  // ---------- Analyse d'un message ----------
  function analyser(texte) {
    const t = norm(texte);
    const marques = Object.keys(ALIAS).filter((m) => contient(t, ALIAS[m]));
    const autresMarques = AUTRES_MARQUES.filter((m) => contient(t, [m]));
    const genre = Object.keys(GENRES).find((g) => contient(t, GENRES[g])) || "";
    const type = Object.keys(TYPES).find((k) => contient(t, TYPES[k])) || "";
    const gamme = Object.keys(GAMMES).find((k) => contient(t, GAMMES[k])) || "";
    const intentions = Object.keys(INTENTIONS).filter((k) => contient(t, INTENTIONS[k]));
    // Recherche directe d'un produit par un mot distinctif de son nom (ex. « submariner », « boisé »)
    const produitsNommes = PRODUITS.filter((p) => norm(p.nom).trim().split(" ")
      .filter((w) => w.length >= 4 && !["montre", "parfum", "homme", "femme", "enfant"].includes(w) && !norm(p.marque || "").includes(` ${w} `))
      .some((w) => t.includes(` ${w} `)));
    const nbMots = t.trim().split(" ").length;
    return { t, marques, autresMarques, genre, type, gamme, intentions, produitsNommes, nbMots };
  }

  // ---------- Mémoire de conversation (pour « et pour femme ? », « combien ? ») ----------
  const contexte = { type: "", genre: "", gamme: "", marques: [], produits: [] };
  // Un article « mixte » convient aussi pour homme et pour femme
  const genreOk = (p, g) => !g || p.genre === g || (p.genre === "mixte" && (g === "homme" || g === "femme"));

  // ---------- Construction des réponses ----------
  const carteProduit = (p) => `
    <a class="ia-produit" href="#/produit/${p.id}" data-ia-lien>
      <img src="${p.image.replace("w=800&h=800", "w=160&h=160")}" alt="">
      <span><strong>${esc(p.nom)}</strong><small>${aPrix(p) ? fmt(p.prix) : "Prix sur demande"}</small></span>
    </a>`;
  const bouton = (libelle, href, externe = false) =>
    `<a class="ia-btn" href="${href}" ${externe ? 'target="_blank" rel="noopener"' : "data-ia-lien"}>${esc(libelle)}</a>`;
  const lienBoutique = ({ type, genre, marque, gamme }) => {
    const p = new URLSearchParams();
    if (type) p.set("type", type);
    if (genre) p.set("genre", genre);
    if (gamme) p.set("gamme", gamme);
    if (marque) p.set("marque", marque);
    const s = p.toString();
    return `#/boutique${s ? "?" + s : ""}`;
  };
  const listeMarques = () => Object.keys(ALIAS).filter((m) => PRODUITS.some((p) => p.marque === m));
  const libelleType = { montre: "montres", parfum: "parfums", bracelet: "bracelets" };
  const libelleGenre = { homme: "pour homme", femme: "pour femme", mixte: "pour couple / mixtes", enfant: "pour enfant" };
  const libelleGamme = { prestige: "de prestige", marque: "de marque" };
  const marquesGamme = (g) => listeMarques().filter((m) => PRODUITS.some((p) => p.marque === m && p.gamme === g));

  const SUGGESTIONS = ["Avez-vous des Rolex ?", "Montres de prestige", "Montres pour femme", "Parfums homme", "Une idée cadeau", "Horaires et adresse"];
  const refus = () => ({
    html: `Désolé, je suis l'assistant de <strong>${esc(BOUTIQUE.nom)}</strong> : je réponds uniquement aux questions sur les <strong>montres et parfums</strong> disponibles sur notre site (marques, modèles, prix, idées cadeaux) et sur la boutique. 🙂`,
    suggestions: SUGGESTIONS,
  });

  function repondre(texte) {
    const a = analyser(texte);
    const i = (k) => a.intentions.includes(k);
    const parties = [];

    // 1) Infos pratiques sur la boutique
    if (i("horaires")) parties.push(`🕗 <strong>Horaires :</strong> ${esc(BOUTIQUE.horaires)}.`);
    if (i("adresse")) parties.push(`📍 <strong>Adresse :</strong> ${esc(BOUTIQUE.adresse)} (${esc(BOUTIQUE.boitePostale)}).<br>${bouton("Itinéraire Google Maps", BOUTIQUE.carte, true)}`);
    if (i("contact")) parties.push(`📞 <strong>Téléphone :</strong> <a href="tel:${tel}">${esc(BOUTIQUE.telephone)}</a><br>💬 <strong>WhatsApp :</strong> ${esc(BOUTIQUE.whatsappAffiche)}${BOUTIQUE.instagram ? `<br>📸 <strong>Instagram :</strong> <a href="https://www.instagram.com/${encodeURIComponent(BOUTIQUE.instagram)}/" target="_blank" rel="noopener">@${esc(BOUTIQUE.instagram)}</a>` : ""}${BOUTIQUE.facebook ? `<br>👍 <strong>Facebook :</strong> <a href="https://www.facebook.com/${encodeURIComponent(BOUTIQUE.facebook)}" target="_blank" rel="noopener">${esc(BOUTIQUE.facebook)}</a>` : ""}${BOUTIQUE.snapchat ? `<br>👻 <strong>Snapchat :</strong> ${esc(BOUTIQUE.snapchat.toUpperCase())}` : ""}<br>✉️ <strong>E-mail :</strong> <a href="mailto:${esc(BOUTIQUE.email)}">${esc(BOUTIQUE.email)}</a><br>${bouton("Écrire sur WhatsApp", lienWa("Bonjour La Maison du Temps !"), true)}`);
    if (i("livraison")) parties.push(`🚚 Pour la livraison (délais, zones, frais), le plus simple est de nous écrire sur WhatsApp au ${esc(BOUTIQUE.whatsappAffiche)} : nous vous répondons rapidement.`);
    if (i("paiement")) parties.push(`💳 Pour les moyens de paiement acceptés, contactez-nous sur WhatsApp au ${esc(BOUTIQUE.whatsappAffiche)} ou passez en boutique.`);
    if (i("authenticite")) parties.push(`ℹ️ Pour toute question sur l'origine, les papiers ou la garantie d'un modèle précis, contactez directement la boutique : l'équipe vous répondra pour chaque pièce.<br>${bouton("Poser la question sur WhatsApp", lienWa("Bonjour, j'ai une question sur la garantie d'un modèle."), true)}`);

    // 2) Marques que nous n'avons pas
    if (a.autresMarques.length && !a.marques.length) {
      const nom = a.autresMarques[0].replace(/\b\w/g, (c) => c.toUpperCase());
      if (a.type === "parfum") parties.push(`Nous n'avons pas de parfum <strong>${esc(nom)}</strong> sur le site pour le moment. Voici les parfums que nous proposons :<div class="ia-produits">${PRODUITS.filter((p) => p.type === "parfum").slice(0, 6).map(carteProduit).join("")}</div>${bouton("Demander sur WhatsApp", lienWa(`Bonjour, avez-vous des parfums ${nom} ?`), true)}`);
      else parties.push(`Nous n'avons pas de modèle <strong>${esc(nom)}</strong> sur le site pour le moment. Nos marques : ${listeMarques().map(esc).join(", ")}. N'hésitez pas à nous demander sur WhatsApp, nous avons parfois d'autres modèles en boutique.<br>${bouton("Demander sur WhatsApp", lienWa(`Bonjour, avez-vous des modèles ${nom} ?`), true)}`);
    }

    // 3) Liste des marques
    if (i("marques") && !a.marques.length && !a.autresMarques.length) {
      const puces = (liste) => `<div class="ia-chips">${liste.map((m) => `<a href="${lienBoutique({ marque: m })}" data-ia-lien>${esc(m)}</a>`).join("")}</div>`;
      parties.push(`Voici nos marques :<br><strong>Montres de prestige</strong>${puces(marquesGamme("prestige"))}<br><strong>Montres de marque</strong>${puces(marquesGamme("marque"))}<br>Nous avons aussi des <a href="#/boutique?type=parfum" data-ia-lien>parfums</a> et des <a href="#/boutique?type=bracelet" data-ia-lien>bracelets</a>.`);
    }

    // 4) Recherche de produits
    let type = a.type;
    let genre = a.genre;
    let marques = a.marques;
    let gamme = a.gamme;
    const suite = !type && !marques.length && !a.produitsNommes.length && !i("cadeau") && (genre || i("prix"));
    if (suite && contexte.type) type = contexte.type;            // « et pour femme ? »
    if (suite && !genre && contexte.genre) genre = contexte.genre;
    if (suite && !marques.length && contexte.marques.length && !a.genre) marques = contexte.marques;

    if (gamme && !type) type = "montre";
    const chercheProduits = a.produitsNommes.length || marques.length || type || gamme ||
      i("catalogue") || i("cadeau") || i("prix") || (genre && a.nbMots <= 6);

    if (chercheProduits) {
      let liste;
      // Un modèle précis (« Day-Date », « squelette »…) l'emporte sur la marque entière
      const precis = a.produitsNommes.filter((p) => !marques.length || marques.includes(p.marque));
      if (precis.length) liste = precis;
      else liste = PRODUITS.filter((p) =>
        (!marques.length || marques.includes(p.marque)) &&
        (!type || p.type === type) &&
        (!gamme || p.gamme === gamme) &&
        genreOk(p, genre));

      // Idée cadeau sans précision : un mélange montres + parfums
      if (i("cadeau") && !type && !marques.length) {
        const pool = PRODUITS.filter((p) => genreOk(p, genre));
        liste = [...pool.filter((p) => p.type === "montre").slice(0, 3), ...pool.filter((p) => p.type !== "montre").slice(0, 2)];
      }
      // « combien ? » juste après une réponse : on reprend les produits montrés
      const suitePrix = i("prix") && !a.marques.length && !a.type && !a.produitsNommes.length && !a.genre && contexte.produits.length;
      if (suitePrix) liste = contexte.produits;

      if (liste.length) {
        const total = liste.length;
        const montres = liste.slice(0, 6);
        const desc = [type ? libelleType[type] : "articles", gamme ? libelleGamme[gamme] : "", genre ? libelleGenre[genre] : "", marques.length ? marques.join(" / ") : ""]
          .filter(Boolean).join(" ");
        let intro;
        if (suitePrix) intro = `Voici les prix de ${total > 1 ? "ces articles" : "cet article"} :`;
        else if (i("cadeau") && !type) intro = `🎁 Bonne idée ! Voici quelques suggestions de cadeaux${genre ? " " + libelleGenre[genre] : ""} :`;
        else if (marques.length === 1 && total === 1) intro = `Oui, nous avons ce modèle <strong>${esc(marques[0])}</strong> :`;
        else if (marques.length) intro = `Oui ! Voici nos ${esc(desc)} (${total}) :`;
        else intro = `Voici nos ${esc(desc)} (${total}) :`;

        const sansPrix = montres.filter((p) => !aPrix(p)).length;
        let note = "";
        if (i("prix") || sansPrix) {
          note = sansPrix === montres.length
            ? `<p class="ia-note">Les prix sont communiqués <strong>sur demande</strong> : écrivez-nous sur WhatsApp et nous vous répondons rapidement.</p>`
            : sansPrix ? `<p class="ia-note">Certains prix sont communiqués sur demande via WhatsApp.</p>` : "";
        }
        const voirTout = total > montres.length || marques.length || type || genre
          ? bouton(total > montres.length ? `Voir les ${total} articles` : "Voir dans la boutique", lienBoutique({ type, genre, gamme, marque: marques.length === 1 ? marques[0] : "" }))
          : "";
        const waTxt = montres.length === 1
          ? `Bonjour, je suis intéressé(e) par « ${montres[0].nom} ». Pouvez-vous m'indiquer le prix et la disponibilité ?`
          : `Bonjour, je souhaite des informations sur vos ${desc}.`;
        parties.push(`${intro}<div class="ia-produits">${montres.map(carteProduit).join("")}</div>${note}<div class="ia-actions">${voirTout}${bouton("Demander sur WhatsApp", lienWa(waTxt), true)}</div>`);

        contexte.type = type; contexte.genre = genre; contexte.gamme = gamme; contexte.marques = marques; contexte.produits = montres;
      } else if (!a.autresMarques.length) {
        parties.push(`Je n'ai pas trouvé d'article correspondant sur le site${genre ? " " + libelleGenre[genre] : ""}. Nous avons peut-être d'autres modèles en boutique : demandez-nous !<br>${bouton("Demander sur WhatsApp", lienWa(`Bonjour, je cherche : ${texte}`), true)}`);
      }
    }

    if (parties.length) return { html: parties.join("<hr>") };

    // 5) Politesse
    if (i("salut") && a.nbMots <= 4) return { html: `Bonjour 👋 Que recherchez-vous aujourd'hui ? Une montre, un parfum, une idée cadeau ?`, suggestions: SUGGESTIONS };
    if (i("merci")) return { html: `Avec plaisir ! 😊 Avez-vous une autre question sur nos montres ou nos parfums ?` };

    // 6) Hors sujet → refus
    return refus();
  }

  // ---------- Interface ----------
  const ICONE_CHAT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-width="2.6"/></svg>`;
  const ICONE_FERMER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
  const ICONE_ENVOI = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

  function installer() {
    const racine = document.createElement("div");
    racine.className = "ia";
    racine.innerHTML = `
      <button class="ia-fab" id="ia-fab" aria-label="Ouvrir l'assistant" aria-expanded="false">
        ${ICONE_CHAT}<span>Assistant</span>
      </button>
      <section class="ia-panneau" id="ia-panneau" role="dialog" aria-label="Assistant La Maison du Temps">
        <header class="ia-tete">
          <div class="ia-avatar">LMT</div>
          <div><strong>Assistant LMT</strong><small>Montres & parfums · réponse immédiate</small></div>
          <button class="ia-fermer" id="ia-fermer" aria-label="Fermer">${ICONE_FERMER}</button>
        </header>
        <div class="ia-fil" id="ia-fil" aria-live="polite"></div>
        <form class="ia-saisie" id="ia-form" autocomplete="off">
          <input id="ia-input" type="text" maxlength="300" placeholder="Posez votre question sur nos montres ou parfums…" aria-label="Votre question">
          <button type="submit" aria-label="Envoyer">${ICONE_ENVOI}</button>
        </form>
      </section>`;
    document.body.appendChild(racine);

    const fab = $("#ia-fab"), panneau = $("#ia-panneau"), fil = $("#ia-fil"), input = $("#ia-input");
    let accueilFait = false;

    const defiler = () => { fil.scrollTop = fil.scrollHeight; };
    const ajouter = (qui, html, suggestions) => {
      const m = document.createElement("div");
      m.className = `ia-msg ia-${qui}`;
      m.innerHTML = html + (suggestions ? `<div class="ia-chips">${suggestions.map((s) => `<button type="button" data-ia-suggestion="${esc(s)}">${esc(s)}</button>`).join("")}</div>` : "");
      fil.appendChild(m);
      defiler();
    };
    const ecrit = () => {
      const m = document.createElement("div");
      m.className = "ia-msg ia-bot ia-ecrit";
      m.innerHTML = "<span></span><span></span><span></span>";
      fil.appendChild(m);
      defiler();
      return m;
    };

    function ouvrir() {
      panneau.classList.add("visible");
      fab.classList.add("cache");
      fab.setAttribute("aria-expanded", "true");
      if (!accueilFait) {
        accueilFait = true;
        ajouter("bot", `Bonjour 👋 Je suis l'assistant de <strong>${esc(BOUTIQUE.nom)}</strong>.<br>Posez-moi vos questions sur nos <strong>montres</strong> et nos <strong>parfums</strong> : marques, modèles, prix, idées cadeaux…`, SUGGESTIONS);
      }
      setTimeout(() => input.focus(), 250);
    }
    function fermer() {
      panneau.classList.remove("visible");
      fab.classList.remove("cache");
      fab.setAttribute("aria-expanded", "false");
    }
    function envoyer(texte) {
      texte = texte.trim();
      if (!texte) return;
      ajouter("moi", esc(texte));
      input.value = "";
      const indicateur = ecrit();
      setTimeout(() => {
        indicateur.remove();
        let r;
        try { r = repondre(texte); } catch (err) { r = { html: "Oups, je n'ai pas compris. Pouvez-vous reformuler ?" }; }
        ajouter("bot", r.html, r.suggestions);
      }, 450 + Math.random() * 450);
    }

    fab.addEventListener("click", ouvrir);
    $("#ia-fermer").addEventListener("click", fermer);
    $("#ia-form").addEventListener("submit", (e) => { e.preventDefault(); envoyer(input.value); });
    fil.addEventListener("click", (e) => {
      const s = e.target.closest("[data-ia-suggestion]");
      if (s) { envoyer(s.dataset.iaSuggestion); return; }
      // Sur mobile, on ferme l'assistant quand on ouvre une page du site
      if (e.target.closest("[data-ia-lien]") && window.matchMedia("(max-width: 560px)").matches) fermer();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panneau.classList.contains("visible")) fermer(); });
  }

  // Exposé pour pouvoir tester l'assistant depuis la console : LMT_assistant("avez-vous des rolex ?")
  window.LMT_assistant = (q) => repondre(q).html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  installer();
})();
