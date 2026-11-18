// ===============================================
//  LA MAISON DU TEMPS — Application (100 % JavaScript)
//  Rend toutes les pages, gère le panier, les favoris,
//  les filtres et la commande via WhatsApp.
// ===============================================

(() => {
  "use strict";

  // ---------- Utilitaires ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt = (n) => n.toLocaleString("fr-FR").replace(/ | /g, " ") + " " + BOUTIQUE.devise;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const parId = (id) => PRODUITS.find((p) => p.id === Number(id));

  const stockage = {
    lire(cle, defaut) { try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; } catch { return defaut; } },
    ecrire(cle, val) { try { localStorage.setItem(cle, JSON.stringify(val)); } catch { /* stockage indisponible */ } },
  };

  // ---------- État ----------
  const etat = {
    panier: stockage.lire("lmdt-panier", []).filter((l) => parId(l.id) && typeof parId(l.id).prix === "number"),
    favoris: stockage.lire("lmdt-favoris", []).filter((id) => parId(id)),
    ongletAccueil: "tous",
  };
  const sauver = () => {
    stockage.ecrire("lmdt-panier", etat.panier);
    stockage.ecrire("lmdt-favoris", etat.favoris);
  };

  // ---------- Icônes SVG ----------
  const svg = (chemin, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${extra}>${chemin}</svg>`;
  const ICONES = {
    sac: svg('<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>'),
    coeur: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
    loupe: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    croix: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    fleche: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 'width="16" height="16"'),
    retour: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>', 'width="16" height="16"'),
    camion: svg('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>'),
    bouclier: svg('<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/>'),
    cadeau: svg('<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z"/>'),
    paiement: svg('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>'),
    check: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    horloge: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    repere: svg('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    tel: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    filtre: svg('<path d="M4 6h16M7 12h10M10 18h4"/>', 'width="16" height="16"'),
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.2-.2-.4-.3z"/></svg>',
  };

  const etoiles = (note) => {
    const pleines = Math.round(note);
    return `<div class="etoiles">${"★".repeat(pleines)}${"☆".repeat(5 - pleines)}<small>${note.toFixed(1)}</small></div>`;
  };

  // ---------- Logo LMT (dessiné en SVG) ----------
  let logoN = 0;
  function monogramme() {
    const g = `or-${++logoN}`;
    // Cadran d'horloge : 12 graduations
    const graduations = Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      const r1 = i % 3 === 0 ? 17 : 19.5;
      return `<line x1="${(84 + Math.sin(a) * r1).toFixed(1)}" y1="${(30 - Math.cos(a) * r1).toFixed(1)}" x2="${(84 + Math.sin(a) * 22).toFixed(1)}" y2="${(30 - Math.cos(a) * 22).toFixed(1)}" stroke-width="${i % 3 === 0 ? 2 : 1}"/>`;
    }).join("");
    return `
      <svg class="logo-mono" viewBox="0 0 120 96" aria-hidden="true">
        <defs>
          <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#f6e08e"/><stop offset=".45" stop-color="#d4a93a"/>
            <stop offset=".7" stop-color="#f1d77a"/><stop offset="1" stop-color="#a87a1f"/>
          </linearGradient>
        </defs>
        <g stroke="url(#${g})" fill="none" stroke-linecap="round">
          <circle cx="84" cy="30" r="25" stroke-width="2.2"/>
          ${graduations}
          <path d="M84 30 L84 15 M84 30 L95 37" stroke-width="2.4"/>
        </g>
        <circle cx="84" cy="30" r="2.4" fill="url(#${g})"/>
        <text x="4" y="78" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="70" fill="url(#${g})">L</text>
        <text x="38" y="78" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="46" fill="url(#${g})">MT</text>
        <path d="M6 86 C 40 96, 80 96, 112 82" stroke="url(#${g})" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>`;
  }
  const logo = () => `
    <a href="#/" class="logo" aria-label="${BOUTIQUE.nom} — accueil">
      ${monogramme()}
      <span class="logo-texte">
        <span class="logo-script">La Maison</span>
        <span class="logo-du">DU TEMPS</span>
      </span>
    </a>`;

  // Icône de l'onglet du navigateur (favicon) générée en JavaScript
  function installerFavicon() {
    const svgFav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0f0e0d"/><rect x="3" y="3" width="58" height="58" rx="10" fill="none" stroke="#d4a93a" stroke-width="2"/><text x="32" y="43" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="26" fill="#e9c860">LMT</text></svg>`;
    const lien = document.createElement("link");
    lien.rel = "icon";
    lien.href = "data:image/svg+xml," + encodeURIComponent(svgFav);
    document.head.appendChild(lien);
  }

  // ---------- Menus déroulants ----------
  const marquesDe = (type) => [...new Set(PRODUITS.filter((p) => p.type === type && p.marque && p.marque !== "Junior").map((p) => p.marque))]
    .sort((a, b) => a.localeCompare(b));
  const menuDeroulant = (cle, libelle, groupes) => `
    <div class="nav-item">
      <button class="dd-btn" data-action="dropdown" data-nav="${cle}" aria-expanded="false" aria-haspopup="true">
        ${libelle} ${svg('<path d="m6 9 6 6 6-6"/>')}
      </button>
      <div class="dropdown" role="menu">
        ${groupes.map((g) => `
          <div class="dd-col">
            <h6>${g.titre}</h6>
            <div class="${g.classe || ""}">${g.liens.map(([href, l]) => `<a href="${href}" role="menuitem">${esc(l)}</a>`).join("")}</div>
          </div>`).join("")}
      </div>
    </div>`;
  function fermerMenus(sauf) {
    $$(".nav-item.ouvert").forEach((m) => {
      if (m !== sauf) { m.classList.remove("ouvert"); $(".dd-btn", m).setAttribute("aria-expanded", "false"); }
    });
  }

  // ---------- Squelette du site (rendu une seule fois) ----------
  function rendreSquelette() {
    $("#app").innerHTML = `
      <div class="annonce">✦ Livraison offerte dès ${fmt(BOUTIQUE.livraisonGratuiteDes)}<span class="annonce-plus"> d'achat — Paiement à la livraison</span> ✦</div>
      <header class="header">
        <div class="container header-inner">
          <button class="icon-btn burger" data-action="menu" aria-label="Menu">${ICONES.menu}</button>
          ${logo()}
          <nav class="nav" id="nav">
            <div class="nav-tete">
              <span>Menu</span>
              <button class="icon-btn" data-action="tout-fermer" aria-label="Fermer le menu">${ICONES.croix}</button>
            </div>
            <a href="#/" data-nav="accueil">Accueil</a>
            ${menuDeroulant("montre", "Montres", [
              { titre: "Pour qui ?", liens: [
                ["#/boutique?type=montre", "Toutes les montres"],
                ["#/boutique?type=montre&genre=homme", "Montres homme"],
                ["#/boutique?type=montre&genre=femme", "Montres femme"],
                ["#/boutique?type=montre&genre=enfant", "Montres enfant"],
                ["#/boutique?type=bracelet", "Bracelets"],
              ] },
              { titre: "Marques", classe: "dd-marques", liens: marquesDe("montre").map((m) => [`#/boutique?marque=${encodeURIComponent(m)}`, m]) },
            ])}
            ${menuDeroulant("parfum", "Parfums", [
              { titre: "Pour qui ?", liens: [
                ["#/boutique?type=parfum", "Tous les parfums"],
                ["#/boutique?type=parfum&genre=homme", "Parfums homme"],
                ["#/boutique?type=parfum&genre=femme", "Parfums femme"],
                ["#/boutique?type=parfum&genre=enfant", "Parfums enfant"],
              ] },
            ])}
            <a href="#/actualites" data-nav="actualites">Actualités</a>
            <a href="#/qui-sommes-nous" data-nav="apropos">Qui sommes-nous</a>
          </nav>
          <div class="header-actions">
            <button class="icon-btn" data-action="recherche" aria-label="Rechercher">${ICONES.loupe}</button>
            <a class="icon-btn" href="#/boutique?favoris=1" aria-label="Favoris">${ICONES.coeur}<span class="compteur" id="nb-favoris"></span></a>
            <button class="icon-btn" data-action="ouvrir-panier" aria-label="Panier">${ICONES.sac}<span class="compteur" id="nb-panier"></span></button>
          </div>
        </div>
        <div class="recherche-bar" id="recherche-bar">
          <div class="container"><input id="recherche-input" type="search" placeholder="Rechercher une montre, un parfum…" autocomplete="off"></div>
        </div>
      </header>

      <main id="page"></main>

      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              ${logo()}
              <p>Des montres et des parfums choisis avec passion pour homme, femme et enfant. L'élégance à chaque instant.</p>
            </div>
            <div>
              <h5>Boutique</h5>
              <ul>
                <li><a href="#/boutique?type=montre">Montres</a></li>
                <li><a href="#/boutique?type=parfum">Parfums</a></li>
                <li><a href="#/boutique?promo=1">Promotions</a></li>
                <li><a href="#/boutique?favoris=1">Mes favoris</a></li>
                <li><a href="#/actualites">Actualités</a></li>
                <li><a href="#/qui-sommes-nous">Qui sommes-nous</a></li>
              </ul>
            </div>
            <div>
              <h5>Collections</h5>
              <ul>
                <li><a href="#/boutique?genre=homme">Homme</a></li>
                <li><a href="#/boutique?genre=femme">Femme</a></li>
                <li><a href="#/boutique?genre=enfant">Enfant</a></li>
              </ul>
            </div>
            <div>
              <h5>Contact</h5>
              <ul>
                <li><a href="${BOUTIQUE.carte}" target="_blank" rel="noopener">${BOUTIQUE.adresse}</a></li>
                <li>${BOUTIQUE.horaires}</li>
                <li><a href="tel:${BOUTIQUE.telephone.replace(/\s/g, "")}">${BOUTIQUE.telephone}</a></li>
                <li><a href="mailto:${BOUTIQUE.email}">${BOUTIQUE.email}</a></li>
                <li><a href="https://wa.me/${BOUTIQUE.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bas">
            <span>© ${new Date().getFullYear()} ${BOUTIQUE.nom}. Tous droits réservés.</span>
            <span>Paiement : Orange Money · Moov Money · Espèces à la livraison</span>
          </div>
        </div>
      </footer>

      <div class="voile" id="voile" data-action="tout-fermer"></div>

      <aside class="tiroir" id="tiroir" aria-label="Panier">
        <div class="tiroir-tete">
          <h3>Mon panier</h3>
          <button class="icon-btn" data-action="fermer-panier" aria-label="Fermer">${ICONES.croix}</button>
        </div>
        <div class="tiroir-corps" id="tiroir-corps"></div>
        <div class="tiroir-pied" id="tiroir-pied"></div>
      </aside>

      <div class="modal" id="modal">
        <div class="modal-boite" id="modal-boite"></div>
      </div>

      <div class="toast" id="toast"></div>

      <button class="haut-de-page" id="haut-de-page" data-action="haut" aria-label="Remonter en haut de la page" title="Haut de page">
        ${svg('<path d="M12 19V5M5 12l7-7 7 7"/>')}
      </button>

      <a class="whatsapp-flottant" href="https://wa.me/${BOUTIQUE.whatsapp}" target="_blank" rel="noopener" aria-label="Nous écrire sur WhatsApp">${ICONES.whatsapp}</a>
    `;
  }

  // ---------- Prix / WhatsApp ----------
  const aPrix = (p) => typeof p.prix === "number" && p.prix > 0;
  const prixHTML = (p) => aPrix(p)
    ? `<strong>${fmt(p.prix)}</strong>${p.ancienPrix ? `<s>${fmt(p.ancienPrix)}</s>` : ""}`
    : `<strong class="sur-demande">Prix sur demande</strong>`;
  const lienWhatsApp = (p) => `https://wa.me/${BOUTIQUE.whatsapp}?text=${encodeURIComponent(
    aPrix(p)
      ? `Bonjour, je suis intéressé(e) par « ${p.nom} » à ${fmt(p.prix)}. Est-il disponible ?`
      : `Bonjour, je suis intéressé(e) par « ${p.nom} ». Pouvez-vous m'indiquer le prix et les modèles disponibles ?`)}`;
  const libelleType = (t) => ({ montre: "Montre", parfum: "Parfum", bracelet: "Bracelet" }[t] || cap(t));

  // ---------- Carte produit ----------
  function carteProduit(p, i = 0) {
    const fav = etat.favoris.includes(p.id);
    const action = aPrix(p)
      ? `<button class="ajout-rapide" data-action="ajouter" data-id="${p.id}">Ajouter au panier</button>`
      : `<a class="ajout-rapide" href="${lienWhatsApp(p)}" target="_blank" rel="noopener">Demander le prix</a>`;
    return `
      <article class="carte" style="animation-delay:${Math.min(i, 12) * 50}ms">
        <div class="carte-media" data-action="voir" data-id="${p.id}">
          <img src="${p.image}" alt="${esc(p.nom)}" loading="lazy">
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          ${p.illustration ? `<span class="illus">Photo d'illustration</span>` : ""}
          <button class="fav-btn ${fav ? "actif" : ""}" data-action="favori" data-id="${p.id}" aria-label="Ajouter aux favoris">${ICONES.coeur}</button>
          ${action}
        </div>
        <div class="carte-info">
          <span class="carte-cat">${esc(p.marque && p.marque !== "Junior" && p.marque !== "Parfums" ? p.marque : libelleType(p.type))} · ${cap(p.genre)}</span>
          <h3 class="carte-nom" data-action="voir" data-id="${p.id}">${esc(p.nom)}</h3>
          <div class="prix">${prixHTML(p)}</div>
        </div>
      </article>`;
  }

  // ---------- Page : Accueil ----------
  function pageAccueil() {
    const nb = (cle, val) => PRODUITS.filter((p) => p[cle] === val).length;
    const onglets = [["tous", "Tout"], ["montre", "Montres"], ["parfum", "Parfums"]];
    const vedettes = () => PRODUITS
      .filter((p) => etat.ongletAccueil === "tous" || p.type === etat.ongletAccueil)
      .sort((a, b) => b.note - a.note)
      .slice(0, 8);

    // Marques présentes dans le catalogue (hors catégories génériques)
    const MARQUES = [...new Set(PRODUITS.filter((p) => p.type !== "parfum" && p.marque && p.marque !== "Junior").map((p) => p.marque))];

    $("#page").innerHTML = `
      <section class="hero">
        <div class="hero-bg" style="background-image:url('${IMAGES.hero}')"></div>
        <div class="container"><div class="hero-contenu">
          <span class="sur-titre">L'art du temps · Ouagadougou</span>
          <h1>Le temps a son <em>élégance</em>, le parfum sa signature.</h1>
          <p>Rolex, Omega, Cartier, Audemars Piguet, Hublot, Tissot, Casio, Lacoste… et nos parfums pour homme, femme et enfant.</p>
          <div class="hero-btns">
            <a href="#/boutique?type=montre" class="btn btn-or">Nos montres ${ICONES.fleche}</a>
            <a href="#/boutique?type=parfum" class="btn btn-contour">Nos parfums</a>
          </div>
        </div></div>
      </section>

      <section class="atouts">
        <div class="container atouts-grid">
          <div class="atout">${ICONES.camion}<div><strong>Livraison rapide</strong><span>24–72 h partout au pays</span></div></div>
          <div class="atout">${ICONES.bouclier}<div><strong>Conseil en boutique</strong><span>Essayez avant d'acheter</span></div></div>
          <div class="atout">${ICONES.paiement}<div><strong>Paiement facile</strong><span>Mobile money ou à la livraison</span></div></div>
          <div class="atout">${ICONES.cadeau}<div><strong>Emballage cadeau</strong><span>Offert sur demande</span></div></div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-tete">
            <span class="sur-titre">Nos collections</span>
            <h2>Pour chacun, son style</h2>
          </div>
          <div class="genres">
            ${["homme", "femme", "enfant"].map((g) => `
              <a href="#/boutique?genre=${g}" class="genre-carte">
                <img src="${IMAGES[g]}" alt="Collection ${g}" loading="lazy">
                <div><h3>${cap(g)}</h3><span>${nb("genre", g)} articles ${ICONES.fleche}</span></div>
              </a>`).join("")}
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="section-tete">
            <span class="sur-titre">Sélection</span>
            <h2>Les incontournables</h2>
            <p>Les pièces phares de La Maison du Temps.</p>
          </div>
          <div class="onglets">
            ${onglets.map(([v, l]) => `<button class="onglet ${etat.ongletAccueil === v ? "actif" : ""}" data-action="onglet" data-val="${v}">${l}</button>`).join("")}
          </div>
          <div class="grille" id="grille-vedettes">${vedettes().map(carteProduit).join("")}</div>
          <div style="text-align:center;margin-top:44px">
            <a href="#/boutique" class="btn btn-noir">Voir toute la boutique ${ICONES.fleche}</a>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="container duo">
          <a href="#/boutique?type=montre" class="duo-carte">
            <img src="${IMAGES.montres}" alt="Montres" loading="lazy">
            <div><span class="sur-titre">${nb("type", "montre")} modèles</span><h3>L'art de l'horlogerie</h3><p>Rolex, Omega, Cartier, Hublot, Tissot, Casio…</p><span class="btn btn-contour">Découvrir</span></div>
          </a>
          <a href="#/boutique?type=parfum" class="duo-carte">
            <img src="${IMAGES.parfums}" alt="Parfums" loading="lazy">
            <div><span class="sur-titre">Parfum disponible</span><h3>Sillages inoubliables</h3><p>Homme, femme, enfant et coffrets cadeaux.</p><span class="btn btn-contour">Découvrir</span></div>
          </a>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="section-tete">
            <span class="sur-titre">Actualités</span>
            <h2>Les dernières nouvelles</h2>
          </div>
          <div class="actu-grille">
            ${[...ACTUALITES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((a) => `
              <a class="actu-carte" href="#/actualites/${a.id}">
                <div class="actu-media"><img src="${a.image}" alt="${esc(a.titre)}" loading="lazy"></div>
                <div class="actu-corps">
                  <span class="actu-meta"><span class="actu-cat">${esc(a.categorie)}</span></span>
                  <h3>${esc(a.titre)}</h3>
                  <p>${esc(a.resume)}</p>
                  <span class="actu-lire">Lire la suite ${ICONES.fleche}</span>
                </div>
              </a>`).join("")}
          </div>
          <div style="text-align:center;margin-top:40px">
            <a href="#/actualites" class="btn btn-noir">Toutes les actualités ${ICONES.fleche}</a>
          </div>
        </div>
      </section>

      <section class="section avis-section">
        <div class="container">
          <div class="section-tete">
            <span class="sur-titre">Notre collection</span>
            <h2>Les marques de la maison</h2>
            <p style="color:#a9a097">Cliquez sur une marque pour voir les modèles disponibles.</p>
          </div>
          <div class="marques">
            ${MARQUES.map((m) => `<a href="#/boutique?marque=${encodeURIComponent(m)}">${esc(m)}</a>`).join("")}
            <a href="#/boutique?type=parfum">Parfums</a>
          </div>
        </div>
      </section>

      <section class="section magasin">
        <div class="container magasin-grid">
          <div class="magasin-info">
            <span class="sur-titre">Notre boutique</span>
            <h2>Venez nous rendre visite</h2>
            <p>Découvrez nos montres et nos parfums en boutique, essayez-les et laissez-vous conseiller.</p>
            <ul>
              <li>${ICONES.horloge}<div><strong>Horaires</strong><span>${BOUTIQUE.horaires}</span></div></li>
              <li>${ICONES.repere}<div><strong>Adresse</strong><span>${BOUTIQUE.adresse}<br>${BOUTIQUE.boitePostale}<br>Plus code : ${BOUTIQUE.pluscode}</span></div></li>
              <li>${ICONES.tel}<div><strong>Téléphone</strong><span><a href="tel:${BOUTIQUE.telephone.replace(/\s/g, "")}">${BOUTIQUE.telephone}</a></span></div></li>
            </ul>
            <div class="hero-btns">
              <a class="btn btn-or" href="${BOUTIQUE.carte}" target="_blank" rel="noopener">${ICONES.repere} Itinéraire</a>
              <a class="btn btn-noir" href="tel:${BOUTIQUE.telephone.replace(/\s/g, "")}">${ICONES.tel} Appeler</a>
            </div>
          </div>
          <div class="magasin-carte">
            <iframe src="${BOUTIQUE.carteEmbed}" title="Plan d'accès — ${BOUTIQUE.nom}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
          </div>
        </div>
      </section>

      <section class="section newsletter">
        <div class="container">
          <div class="section-tete" style="margin-bottom:30px">
            <span class="sur-titre">Newsletter</span>
            <h2>-10 % sur votre première commande</h2>
            <p>Inscrivez-vous pour recevoir nos nouveautés et offres exclusives.</p>
          </div>
          <form id="form-newsletter">
            <input type="email" required placeholder="Votre adresse e-mail">
            <button class="btn btn-or" type="submit">S'inscrire</button>
          </form>
        </div>
      </section>
    `;
  }

  // ---------- Page : Boutique ----------
  function pageBoutique(params) {
    const f = {
      type: params.get("type") || "",
      genre: params.get("genre") || "",
      marque: params.get("marque") || "",
      q: (params.get("q") || "").trim(),
      tri: params.get("tri") || "pertinence",
      max: Number(params.get("max")) || 0,
      favoris: params.get("favoris") === "1",
      promo: params.get("promo") === "1",
    };
    const prixConnus = PRODUITS.filter(aPrix).map((p) => p.prix);
    const prixMax = prixConnus.length ? Math.max(...prixConnus) : 0;
    const prixMin = prixConnus.length ? Math.min(...prixConnus) : 0;
    const plafond = f.max || prixMax;

    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    let liste = PRODUITS.filter((p) =>
      (!f.type || p.type === f.type) &&
      (!f.genre || p.genre === f.genre) &&
      (!f.marque || p.marque === f.marque) &&
      (!f.favoris || etat.favoris.includes(p.id)) &&
      (!f.promo || p.ancienPrix) &&
      (!f.max || !aPrix(p) || p.prix <= plafond) &&
      (!f.q || norm(`${p.nom} ${p.marque || ""} ${p.type} ${p.genre} ${p.description}`).includes(norm(f.q)))
    );
    // Les produits « prix sur demande » restent toujours en fin de liste lors d'un tri par prix
    const parPrix = (sens) => (a, b) => (aPrix(b) - aPrix(a)) || (aPrix(a) ? sens * (a.prix - b.prix) : 0);
    const tris = {
      "prix-asc": parPrix(1),
      "prix-desc": parPrix(-1),
      nom: (a, b) => a.nom.localeCompare(b.nom),
    };
    if (tris[f.tri]) liste = [...liste].sort(tris[f.tri]);

    const TYPES = { montre: "Nos montres", parfum: "Nos parfums", bracelet: "Nos bracelets" };
    let titre = "Toute la boutique";
    if (f.favoris) titre = "Mes favoris";
    else if (f.promo) titre = "Promotions";
    else if (f.q) titre = `Recherche : « ${esc(f.q)} »`;
    else if (f.marque) titre = esc(f.marque);
    else if (f.type && f.genre) titre = `${TYPES[f.type] || cap(f.type)} · ${cap(f.genre)}`;
    else if (f.type) titre = TYPES[f.type] || cap(f.type);
    else if (f.genre) titre = `Collection ${cap(f.genre)}`;
    const banniere = f.type === "parfum" ? IMAGES.parfums : f.genre ? IMAGES[f.genre] : IMAGES.montres;

    // Lien qui conserve les filtres actuels en modifiant une clé
    const lien = (cle, val) => {
      const p = new URLSearchParams(params);
      val ? p.set(cle, val) : p.delete(cle);
      if (cle !== "favoris") p.delete("favoris");
      const s = p.toString();
      return `#/boutique${s ? "?" + s : ""}`;
    };
    // Nombre de produits pour une option, en tenant compte des autres filtres actifs
    const compte = (cle, val) => PRODUITS.filter((p) =>
      ["type", "genre", "marque"].every((k) => k === cle ? (!val || p[k] === val) : (!f[k] || p[k] === f[k]))).length;

    // Chaque filtre est une liste déroulante ; les options vides (0 article) sont désactivées
    const groupe = (titreG, cle, options) => `
      <div class="filtre-groupe filtre-${cle}">
        <label class="filtre-label" for="filtre-${cle}">${titreG}</label>
        <div class="select-wrap ${f[cle] ? "actif" : ""}">
          <select id="filtre-${cle}" class="filtre-select" data-filtre="${cle}">
            ${options.map(([v, l]) => {
              const n = compte(cle, v);
              return `<option value="${esc(v)}" ${f[cle] === v ? "selected" : ""} ${v && !n ? "disabled" : ""}>${l} (${n})</option>`;
            }).join("")}
          </select>
        </div>
      </div>`;
    const filtresActifs = ["type", "genre", "marque", "max"].some((k) => params.get(k));
    const marques = [...new Set(PRODUITS.map((p) => p.marque).filter(Boolean))]
      .filter((m) => m !== "Junior" && m !== "Parfums")
      .sort((a, b) => a.localeCompare(b));

    $("#page").innerHTML = `
      <section class="page-tete">
        <img src="${banniere}" alt="">
        <div class="container">
          <div class="fil">Accueil / Boutique</div>
          <h1>${titre}</h1>
        </div>
      </section>
      <div class="container boutique">
        <aside class="filtres" id="filtres">
          ${groupe("Catégorie", "type", [["", "Tout"], ["montre", "Montres"], ["parfum", "Parfums"], ["bracelet", "Bracelets"]])}
          ${groupe("Pour qui ?", "genre", [["", "Tous"], ["homme", "Homme"], ["femme", "Femme"], ["enfant", "Enfant"]])}
          ${groupe("Marques", "marque", [["", "Toutes"], ...marques.map((m) => [m, esc(m)])])}
          ${prixConnus.length > 1 ? `
          <div class="filtre-groupe prix-range">
            <h4>Prix maximum</h4>
            <input type="range" id="prix-range" min="${prixMin}" max="${prixMax}" step="5000" value="${plafond}">
            <div><span>${fmt(prixMin)}</span><strong id="prix-val">${fmt(plafond)}</strong></div>
          </div>` : ""}
          ${filtresActifs ? `<a href="#/boutique" class="filtre-reset">✕ Effacer les filtres</a>` : ""}
        </aside>
        <div>
          <div class="barre-outils">
            <p>${liste.length} article${liste.length > 1 ? "s" : ""}</p>
            <select id="tri" aria-label="Trier">
              ${[["pertinence", "Pertinence"], ["prix-asc", "Prix croissant"], ["prix-desc", "Prix décroissant"], ["nom", "Nom A → Z"]]
                .map(([v, l]) => `<option value="${v}" ${f.tri === v ? "selected" : ""}>${l}</option>`).join("")}
            </select>
          </div>
          <div class="grille">
            ${liste.length ? liste.map(carteProduit).join("") : `
              <div class="vide">
                <h3>${f.favoris ? "Aucun favori pour le moment" : "Aucun article trouvé"}</h3>
                <p>${f.favoris ? "Cliquez sur le ♡ d'un produit pour l'ajouter ici." : "Essayez d'élargir vos critères, ou demandez-nous sur WhatsApp : nous avons d'autres modèles en boutique."}</p>
                <a href="#/boutique" class="btn btn-or" style="margin-top:20px">Voir tous les produits</a>
              </div>`}
          </div>
        </div>
      </div>
    `;

    $("#tri").addEventListener("change", (e) => { location.hash = lien("tri", e.target.value === "pertinence" ? "" : e.target.value); });
    $$(".filtre-select").forEach((s) => s.addEventListener("change", () => { location.hash = lien(s.dataset.filtre, s.value); }));
    const range = $("#prix-range");
    if (range) {
      range.addEventListener("input", () => { $("#prix-val").textContent = fmt(Number(range.value)); });
      range.addEventListener("change", () => { location.hash = lien("max", Number(range.value) >= prixMax ? "" : range.value); });
    }
  }

  // ---------- Page : Fiche produit ----------
  function pageProduit(id) {
    const p = parId(id);
    if (!p) { $("#page").innerHTML = `<div class="container vide"><h3>Produit introuvable</h3><a href="#/boutique" class="btn btn-or">Retour à la boutique</a></div>`; return; }
    let qte = 1;
    const similaires = PRODUITS.filter((x) => x.id !== p.id && x.type === p.type && x.genre === p.genre)
      .concat(PRODUITS.filter((x) => x.id !== p.id && x.type === p.type && x.genre !== p.genre))
      .slice(0, 4);
    const fav = etat.favoris.includes(p.id);
    const economie = aPrix(p) && p.ancienPrix ? Math.round((1 - p.prix / p.ancienPrix) * 100) : 0;
    const boutonFav = `<button class="icon-btn fav-btn ${fav ? "actif" : ""}" style="position:static;width:52px;height:52px;border:1px solid var(--bord);flex-shrink:0" data-action="favori" data-id="${p.id}" aria-label="Favori">${ICONES.coeur}</button>`;
    const iconeWa = ICONES.whatsapp.replace("<svg", '<svg width="20" height="20"');

    $("#page").innerHTML = `
      <div class="container">
        <a href="#/boutique?type=${p.type}&genre=${p.genre}" class="retour">${ICONES.retour} Retour à la boutique</a>
        <div class="fiche">
          <div class="fiche-media">
            <img src="${p.image.replace("w=800&h=800", "w=1200&h=1200")}" alt="${esc(p.nom)}">
            ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
            ${p.illustration ? `<span class="illus">Photo d'illustration — demandez-nous les photos du modèle réel</span>` : ""}
          </div>
          <div class="fiche-info">
            <span class="carte-cat">${libelleType(p.type)} · ${cap(p.genre)}${p.marque && p.marque !== "Junior" && p.marque !== "Parfums" ? " · " + esc(p.marque) : ""}</span>
            <h1>${esc(p.nom)}</h1>
            <div class="prix">${prixHTML(p)}${economie ? `<span class="badge" style="position:static">-${economie}%</span>` : ""}</div>
            <p class="desc">${esc(p.description)}</p>
            <ul class="details">${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
            ${aPrix(p) ? `
            <div class="qte-ligne">
              <div class="qte"><button data-q="-1" aria-label="Moins">−</button><span id="qte-fiche">1</span><button data-q="1" aria-label="Plus">+</button></div>
              <button class="btn btn-or" id="ajout-fiche">${ICONES.sac} Ajouter au panier</button>
              ${boutonFav}
            </div>
            <a class="btn btn-whatsapp" target="_blank" rel="noopener" href="${lienWhatsApp(p)}">${iconeWa} Commander sur WhatsApp</a>` : `
            <div class="qte-ligne">
              <a class="btn btn-whatsapp" style="flex:1" target="_blank" rel="noopener" href="${lienWhatsApp(p)}">${iconeWa} Demander le prix</a>
              ${boutonFav}
            </div>
            <a class="btn btn-noir" href="tel:${BOUTIQUE.telephone.replace(/\s/g, "")}">${ICONES.tel} Appeler la boutique</a>`}
            <div class="garanties">
              <div>${ICONES.repere} En boutique : ${BOUTIQUE.adresse}</div>
              <div>${ICONES.horloge} ${BOUTIQUE.horaires}</div>
              <div>${ICONES.cadeau} Emballage cadeau sur demande</div>
            </div>
          </div>
        </div>
        ${similaires.length ? `
          <section style="padding-bottom:90px">
            <div class="section-tete"><span class="sur-titre">Vous aimerez aussi</span><h2>Produits similaires</h2></div>
            <div class="grille">${similaires.map(carteProduit).join("")}</div>
          </section>` : ""}
      </div>
    `;

    $$(".qte-ligne .qte button").forEach((b) => b.addEventListener("click", () => {
      qte = Math.max(1, Math.min(10, qte + Number(b.dataset.q)));
      $("#qte-fiche").textContent = qte;
    }));
    $("#ajout-fiche")?.addEventListener("click", () => ajouterAuPanier(p.id, qte));
  }

  // ---------- Panier ----------
  const totalPanier = () => etat.panier.reduce((s, l) => s + parId(l.id).prix * l.qte, 0);
  const nbArticles = () => etat.panier.reduce((s, l) => s + l.qte, 0);

  // ---------- Page : Actualités ----------
  const dateFr = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const actusTriees = () => [...ACTUALITES].sort((a, b) => b.date.localeCompare(a.date));
  const lienActu = (a) => a.lien
    ? `<a class="btn btn-or" href="${a.lien.url}" ${a.lien.url.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(a.lien.texte)} ${ICONES.fleche}</a>`
    : "";

  function pageActualites() {
    const [une, ...autres] = actusTriees();
    $("#page").innerHTML = `
      <section class="page-tete">
        <img src="${IMAGES.montres}" alt="">
        <div class="container">
          <div class="fil">Accueil / Actualités</div>
          <h1>Actualités</h1>
        </div>
      </section>
      <div class="container" style="padding:60px 0 90px">
        ${une ? `
        <article class="actu-une" data-actu="${une.id}">
          <div class="actu-media"><img src="${une.image}" alt="${esc(une.titre)}"></div>
          <div class="actu-texte">
            <span class="actu-meta"><span class="actu-cat">${esc(une.categorie)}</span> · ${dateFr(une.date)}</span>
            <h2>${esc(une.titre)}</h2>
            <p>${esc(une.resume)}</p>
            <div class="hero-btns">
              <a class="btn btn-noir" href="#/actualites/${une.id}">Lire la suite ${ICONES.fleche}</a>
            </div>
          </div>
        </article>` : `<div class="vide"><h3>Aucune actualité pour le moment</h3></div>`}
        ${autres.length ? `
        <div class="actu-grille">
          ${autres.map((a, i) => `
            <a class="actu-carte" href="#/actualites/${a.id}" style="animation-delay:${i * 60}ms">
              <div class="actu-media"><img src="${a.image}" alt="${esc(a.titre)}" loading="lazy"></div>
              <div class="actu-corps">
                <span class="actu-meta"><span class="actu-cat">${esc(a.categorie)}</span> · ${dateFr(a.date)}</span>
                <h3>${esc(a.titre)}</h3>
                <p>${esc(a.resume)}</p>
                <span class="actu-lire">Lire la suite ${ICONES.fleche}</span>
              </div>
            </a>`).join("")}
        </div>` : ""}
      </div>
    `;
  }

  function pageArticle(id) {
    const a = ACTUALITES.find((x) => String(x.id) === String(id));
    if (!a) { pageActualites(); return; }
    const suivantes = actusTriees().filter((x) => x.id !== a.id).slice(0, 3);
    $("#page").innerHTML = `
      <div class="container article">
        <a href="#/actualites" class="retour">${ICONES.retour} Toutes les actualités</a>
        <span class="actu-meta" style="margin-top:24px"><span class="actu-cat">${esc(a.categorie)}</span> · ${dateFr(a.date)}</span>
        <h1>${esc(a.titre)}</h1>
        <div class="article-media"><img src="${a.image.replace("w=800&h=800", "w=1400&h=800")}" alt="${esc(a.titre)}"></div>
        <div class="article-corps">
          ${a.contenu.map((par) => `<p>${esc(par)}</p>`).join("")}
          <div class="hero-btns" style="margin-top:30px">
            ${lienActu(a)}
            <a class="btn btn-whatsapp" href="https://wa.me/${BOUTIQUE.whatsapp}" target="_blank" rel="noopener">${ICONES.whatsapp.replace("<svg", '<svg width="20" height="20"')} Nous écrire</a>
          </div>
        </div>
      </div>
      ${suivantes.length ? `
      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="section-tete"><span class="sur-titre">À lire aussi</span><h2>Autres actualités</h2></div>
          <div class="actu-grille">
            ${suivantes.map((x) => `
              <a class="actu-carte" href="#/actualites/${x.id}">
                <div class="actu-media"><img src="${x.image}" alt="${esc(x.titre)}" loading="lazy"></div>
                <div class="actu-corps">
                  <span class="actu-meta"><span class="actu-cat">${esc(x.categorie)}</span> · ${dateFr(x.date)}</span>
                  <h3>${esc(x.titre)}</h3>
                  <span class="actu-lire">Lire la suite ${ICONES.fleche}</span>
                </div>
              </a>`).join("")}
          </div>
        </div>
      </section>` : ""}
    `;
  }

  // ---------- Page : Qui sommes-nous ----------
  function pageAPropos() {
    const A = A_PROPOS;
    const marques = [...new Set(PRODUITS.map((p) => p.marque).filter((m) => m && m !== "Junior" && m !== "Parfums"))];
    const telLien = BOUTIQUE.telephone.replace(/\s/g, "");
    $("#page").innerHTML = `
      <section class="page-tete">
        <img src="${A.banniere}" alt="">
        <div class="container">
          <div class="fil">Accueil / Qui sommes-nous</div>
          <h1>Qui sommes-nous ?</h1>
        </div>
      </section>

      <section class="section">
        <div class="container apropos-histoire">
          <div class="apropos-media"><img src="${A.image}" alt="La Maison du Temps"></div>
          <div class="apropos-texte">
            <span class="sur-titre">${esc(A.surTitre)}</span>
            <h2>${esc(A.titre)}</h2>
            ${A.histoire.map((p) => `<p>${esc(p)}</p>`).join("")}
            <div class="hero-btns" style="margin-top:10px">
              <a href="#/boutique?type=montre" class="btn btn-or">Découvrir nos montres ${ICONES.fleche}</a>
              <a href="#/boutique?type=parfum" class="btn btn-noir">Nos parfums</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section apropos-valeurs-section">
        <div class="container">
          <div class="section-tete">
            <span class="sur-titre">Nos engagements</span>
            <h2>Ce qui nous anime</h2>
          </div>
          <div class="apropos-valeurs">
            ${A.engagements.map((e) => `
              <div class="valeur">
                <div class="valeur-icone">${ICONES[e.icone] || ICONES.check}</div>
                <h3>${esc(e.titre)}</h3>
                <p>${esc(e.texte)}</p>
              </div>`).join("")}
          </div>
        </div>
      </section>

      <section class="section avis-section">
        <div class="container">
          <div class="section-tete">
            <span class="sur-titre">L'art du temps</span>
            <h2>Les marques de la maison</h2>
          </div>
          <div class="marques">
            ${marques.map((m) => `<a href="#/boutique?marque=${encodeURIComponent(m)}">${esc(m)}</a>`).join("")}
            <a href="#/boutique?type=parfum">Parfums</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container apropos-contact">
          <h2>Une question ? Parlons-en.</h2>
          <p>Passez nous voir aux ${esc(BOUTIQUE.adresse)} — ${esc(BOUTIQUE.horaires.toLowerCase())} — ou écrivez-nous.</p>
          <div class="hero-btns" style="justify-content:center">
            <a class="btn btn-whatsapp" href="https://wa.me/${BOUTIQUE.whatsapp}" target="_blank" rel="noopener">${ICONES.whatsapp.replace("<svg", '<svg width="20" height="20"')} WhatsApp</a>
            <a class="btn btn-noir" href="tel:${telLien}">${ICONES.tel} ${esc(BOUTIQUE.telephone)}</a>
            <a class="btn btn-or" href="${BOUTIQUE.carte}" target="_blank" rel="noopener">${ICONES.repere} Itinéraire</a>
          </div>
        </div>
      </section>
    `;
  }

  // ---------- Panier : ajout ----------
  function ajouterAuPanier(id, qte = 1) {
    if (!aPrix(parId(id))) return;
    const ligne = etat.panier.find((l) => l.id === id);
    if (ligne) ligne.qte = Math.min(10, ligne.qte + qte);
    else etat.panier.push({ id, qte });
    sauver();
    majCompteurs();
    rendrePanier();
    toast(`« ${parId(id).nom} » ajouté au panier`);
  }

  function changerQte(id, delta) {
    const ligne = etat.panier.find((l) => l.id === id);
    if (!ligne) return;
    ligne.qte += delta;
    if (ligne.qte <= 0) etat.panier = etat.panier.filter((l) => l.id !== id);
    if (ligne.qte > 10) ligne.qte = 10;
    sauver();
    majCompteurs();
    rendrePanier();
  }

  function rendrePanier() {
    const corps = $("#tiroir-corps");
    const pied = $("#tiroir-pied");
    if (!etat.panier.length) {
      corps.innerHTML = `<div class="panier-vide">${ICONES.sac}<p>Votre panier est vide.</p></div>`;
      pied.innerHTML = `<a href="#/boutique" class="btn btn-noir btn-plein" data-action="fermer-panier">Découvrir la boutique</a>`;
      return;
    }
    corps.innerHTML = etat.panier.map((l) => {
      const p = parId(l.id);
      return `
        <div class="ligne">
          <img src="${p.image.replace("w=800&h=800", "w=200&h=200")}" alt="${esc(p.nom)}">
          <div>
            <h4>${esc(p.nom)}</h4>
            <small>${cap(p.type)} · ${cap(p.genre)}</small>
            <div class="qte">
              <button data-action="qte" data-id="${p.id}" data-d="-1" aria-label="Moins">−</button>
              <span>${l.qte}</span>
              <button data-action="qte" data-id="${p.id}" data-d="1" aria-label="Plus">+</button>
            </div>
          </div>
          <div class="ligne-droite">
            <strong>${fmt(p.prix * l.qte)}</strong>
            <button class="suppr" data-action="qte" data-id="${p.id}" data-d="-99">Retirer</button>
          </div>
        </div>`;
    }).join("");

    const total = totalPanier();
    const reste = BOUTIQUE.livraisonGratuiteDes - total;
    const pct = Math.min(100, (total / BOUTIQUE.livraisonGratuiteDes) * 100);
    pied.innerHTML = `
      <div class="livraison-info">${reste > 0 ? `Plus que <strong>${fmt(reste)}</strong> pour la livraison offerte` : "🎉 Livraison offerte !"}</div>
      <div class="jauge"><div style="width:${pct}%"></div></div>
      <div class="total"><span>Sous-total</span><strong>${fmt(total)}</strong></div>
      <button class="btn btn-or btn-plein" data-action="commander">Passer la commande</button>
    `;
  }

  function majCompteurs() {
    const np = nbArticles();
    const nf = etat.favoris.length;
    $("#nb-panier").textContent = np || "";
    $("#nb-panier").dataset.n = np;
    $("#nb-favoris").textContent = nf || "";
    $("#nb-favoris").dataset.n = nf;
  }

  // ---------- Commande (WhatsApp) ----------
  function ouvrirCommande() {
    fermer("tiroir");
    const total = totalPanier();
    const livraison = total >= BOUTIQUE.livraisonGratuiteDes ? 0 : 2000;
    $("#modal-boite").innerHTML = `
      <button class="icon-btn modal-fermer" data-action="tout-fermer" aria-label="Fermer">${ICONES.croix}</button>
      <h3>Finaliser la commande</h3>
      <p>Remplissez vos informations : votre commande sera envoyée sur WhatsApp pour confirmation.</p>
      <form id="form-commande">
        <div class="champs-duo">
          <div class="champ"><label for="c-nom">Nom complet</label><input id="c-nom" name="nom" required></div>
          <div class="champ"><label for="c-tel">Téléphone</label><input id="c-tel" name="tel" type="tel" required></div>
        </div>
        <div class="champs-duo">
          <div class="champ"><label for="c-ville">Ville</label><input id="c-ville" name="ville" required></div>
          <div class="champ"><label for="c-quartier">Quartier</label><input id="c-quartier" name="quartier" required></div>
        </div>
        <div class="champ"><label for="c-paiement">Mode de paiement</label>
          <select id="c-paiement" name="paiement">
            <option>Espèces à la livraison</option><option>Orange Money</option><option>Moov Money</option>
          </select>
        </div>
        <div class="champ"><label for="c-note">Remarque (facultatif)</label><textarea id="c-note" name="note" rows="2" placeholder="Emballage cadeau, horaire de livraison…"></textarea></div>
        <div class="recap">
          ${etat.panier.map((l) => `<div><span>${l.qte} × ${esc(parId(l.id).nom)}</span><span>${fmt(parId(l.id).prix * l.qte)}</span></div>`).join("")}
          <div><span>Livraison</span><span>${livraison ? fmt(livraison) : "Offerte"}</span></div>
          <div class="total-ligne"><span>Total</span><span>${fmt(total + livraison)}</span></div>
        </div>
        <button class="btn btn-whatsapp btn-plein" type="submit">${ICONES.whatsapp.replace("<svg", '<svg width="20" height="20"')} Envoyer la commande</button>
      </form>
    `;
    ouvrir("modal");
    $("#form-commande").addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const lignes = etat.panier.map((l) => `• ${l.qte} × ${parId(l.id).nom} — ${fmt(parId(l.id).prix * l.qte)}`).join("\n");
      const message =
        `🛍️ *Nouvelle commande — ${BOUTIQUE.nom}*\n\n${lignes}\n\n` +
        `Livraison : ${livraison ? fmt(livraison) : "Offerte"}\n*Total : ${fmt(total + livraison)}*\n\n` +
        `👤 ${d.nom}\n📞 ${d.tel}\n📍 ${d.ville}, ${d.quartier}\n💳 ${d.paiement}` +
        (d.note ? `\n📝 ${d.note}` : "");
      window.open(`https://wa.me/${BOUTIQUE.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      etat.panier = [];
      sauver();
      majCompteurs();
      rendrePanier();
      $("#modal-boite").innerHTML = `
        <div class="merci">
          ${ICONES.check}
          <h3>Merci ${esc(d.nom.split(" ")[0])} !</h3>
          <p style="color:var(--gris);margin:8px 0 24px">Votre commande a été préparée sur WhatsApp. Envoyez le message pour que nous la confirmions rapidement.</p>
          <button class="btn btn-noir" data-action="tout-fermer">Continuer mes achats</button>
        </div>`;
    });
  }

  // ---------- Ouverture / fermeture des panneaux ----------
  function ouvrir(id) {
    $("#" + id).classList.add("ouvert");
    if (id === "nav") document.body.classList.add("menu-ouvert");
    $("#voile").classList.add("ouvert");
    document.body.classList.add("no-scroll");
  }
  function fermer(id) {
    $("#" + id)?.classList.remove("ouvert");
    if (id === "nav") document.body.classList.remove("menu-ouvert");
    if (!$$(".tiroir.ouvert, .modal.ouvert, .nav.ouvert, .filtres.ouvert").length) {
      $("#voile").classList.remove("ouvert");
      document.body.classList.remove("no-scroll");
    }
  }
  function toutFermer() {
    $$(".ouvert").forEach((el) => { if (el.id !== "recherche-bar") el.classList.remove("ouvert"); });
    document.body.classList.remove("no-scroll", "menu-ouvert");
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.innerHTML = `${ICONES.check}<span>${esc(msg)}</span>`;
    t.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("visible"), 2600);
  }

  // ---------- Favoris ----------
  function basculerFavori(id) {
    const estFav = etat.favoris.includes(id);
    etat.favoris = estFav ? etat.favoris.filter((x) => x !== id) : [...etat.favoris, id];
    sauver();
    majCompteurs();
    $$(`.fav-btn[data-id="${id}"]`).forEach((b) => b.classList.toggle("actif", !estFav));
    toast(estFav ? "Retiré des favoris" : "Ajouté aux favoris ♥");
    if (estFav && new URLSearchParams(location.hash.split("?")[1]).get("favoris") === "1") router();
  }

  // ---------- Routeur ----------
  function router() {
    const hash = location.hash.slice(1) || "/";
    const [chemin, requete = ""] = hash.split("?");
    const params = new URLSearchParams(requete);
    toutFermer();

    if (chemin.startsWith("/produit/")) pageProduit(chemin.split("/")[2]);
    else if (chemin === "/boutique") pageBoutique(params);
    else if (chemin.startsWith("/actualites/")) pageArticle(chemin.split("/")[2]);
    else if (chemin === "/actualites") pageActualites();
    else if (chemin === "/qui-sommes-nous") pageAPropos();
    else pageAccueil();

    // Lien actif dans le menu
    const actif = chemin === "/" ? "accueil" : chemin.startsWith("/actualites") ? "actualites" : chemin === "/qui-sommes-nous" ? "apropos" : (params.get("type") && !params.get("genre") ? params.get("type") : params.get("genre") && !params.get("type") ? params.get("genre") : "");
    $$(".nav [data-nav]").forEach((a) => a.classList.toggle("actif", a.dataset.nav === actif));
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // ---------- Événements (délégation) ----------
  function brancherEvenements() {
    document.addEventListener("click", (e) => {
      // Ferme les menus déroulants quand on clique ailleurs ou sur un lien du menu
      const item = e.target.closest(".nav-item");
      if (!item || e.target.closest(".dropdown a")) fermerMenus();
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const id = Number(el.dataset.id);
      switch (el.dataset.action) {
        case "ajouter": e.stopPropagation(); ajouterAuPanier(id); break;
        case "favori": e.stopPropagation(); basculerFavori(id); break;
        case "voir": location.hash = `#/produit/${id}`; break;
        case "qte": changerQte(id, Number(el.dataset.d)); break;
        case "ouvrir-panier": rendrePanier(); ouvrir("tiroir"); break;
        case "fermer-panier": fermer("tiroir"); break;
        case "commander": ouvrirCommande(); break;
        case "menu": ouvrir("nav"); break;
        case "filtres": ouvrir("filtres"); break;
        case "tout-fermer": toutFermer(); break;
        case "haut": {
          const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: reduit ? "auto" : "smooth" });
          break;
        }
        case "dropdown": {
          const menu = el.closest(".nav-item");
          fermerMenus(menu);
          const ouvert = menu.classList.toggle("ouvert");
          el.setAttribute("aria-expanded", String(ouvert));
          break;
        }
        case "onglet": {
          etat.ongletAccueil = el.dataset.val;
          $$(".onglet").forEach((o) => o.classList.toggle("actif", o === el));
          const liste = PRODUITS.filter((p) => etat.ongletAccueil === "tous" || p.type === etat.ongletAccueil)
            .sort((a, b) => b.note - a.note).slice(0, 8);
          $("#grille-vedettes").innerHTML = liste.map(carteProduit).join("");
          break;
        }
        case "recherche": {
          const barre = $("#recherche-bar");
          barre.classList.toggle("ouvert");
          if (barre.classList.contains("ouvert")) setTimeout(() => $("#recherche-input").focus(), 150);
          break;
        }
      }
    });

    // Fermer le menu mobile après clic sur un lien
    $("#nav").addEventListener("click", (e) => { if (e.target.closest("a")) fermer("nav"); });

    // Recherche
    $("#recherche-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = e.target.value.trim();
        location.hash = q ? `#/boutique?q=${encodeURIComponent(q)}` : "#/boutique";
        $("#recherche-bar").classList.remove("ouvert");
      }
    });

    // Newsletter
    document.addEventListener("submit", (e) => {
      if (e.target.id === "form-newsletter") {
        e.preventDefault();
        e.target.reset();
        toast("Merci ! Votre code -10 % : BIENVENUE10");
      }
    });

    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toutFermer(); });

    // Bouton « haut de page » : visible après 500 px de défilement, avec jauge de progression
    const boutonHaut = $("#haut-de-page");
    let rafHaut = 0;
    const majBoutonHaut = () => {
      rafHaut = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      boutonHaut.classList.toggle("visible", y > 500);
      boutonHaut.style.setProperty("--progression", max > 0 ? Math.min(1, y / max) : 0);
    };
    window.addEventListener("scroll", () => { if (!rafHaut) rafHaut = requestAnimationFrame(majBoutonHaut); }, { passive: true });
    window.addEventListener("hashchange", () => setTimeout(majBoutonHaut, 50));
    window.addEventListener("hashchange", router);
  }

  // ---------- Démarrage ----------
  installerFavicon();
  rendreSquelette();
  brancherEvenements();
  majCompteurs();
  rendrePanier();
  router();
})();
