// ===============================================
//  LA MAISON DU TEMPS — Espace gestion (admin.html)
//  Permet de changer les photos et les prix, et d'ajouter des produits.
//  Les changements sont enregistrés dans js/catalogue.js et les photos
//  dans images/produits/, directement sur GitHub. Vercel republie
//  ensuite le site automatiquement.
// ===============================================

(() => {
  "use strict";

  const DEPOT = "daoudaz6666-rgb/LA-MAISON-DU-TEMPS-";
  const BRANCHE = "main";
  const FICHIER = "js/catalogue.js";
  const API = "https://api.github.com/repos/" + DEPOT;
  const CLE_STOCKAGE = "lmdt-admin-cle";

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lirePrix = (v) => { const n = Number(String(v).replace(/\D/g, "")); return n > 0 ? n : null; };
  const formatPrix = (n) => (n ? n.toLocaleString("fr-FR").replace(/\s/g, " ") : "");
  const slug = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "produit";
  const stockage = {
    lire() { try { return localStorage.getItem(CLE_STOCKAGE) || ""; } catch { return ""; } },
    ecrire(v) { try { v ? localStorage.setItem(CLE_STOCKAGE, v) : localStorage.removeItem(CLE_STOCKAGE); } catch { /* indisponible */ } },
  };

  const etat = {
    cle: "",
    base: PRODUITS.map((p) => ({ ...p })), // produits de js/data.js
    cat: { modifs: {}, ajouts: [] },       // contenu de js/catalogue.js
    catSha: null,
    photos: {},    // photos choisies pas encore envoyées : { "__photo:xxx": { blob, url } }
    apercus: {},   // chemin envoyé -> aperçu local (le temps que le site se mette à jour)
    modifies: new Set(),
    enCours: false,
    edition: null, // id du produit ajouté en cours de modification (fenêtre)
  };

  // ---------- GitHub ----------
  async function gh(chemin, options = {}) {
    const rep = await fetch(chemin.startsWith("http") ? chemin : API + chemin, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + etat.cle,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!rep.ok) {
      const err = new Error("GitHub " + rep.status);
      err.status = rep.status;
      throw err;
    }
    return rep.status === 204 ? null : rep.json();
  }

  const base64VersTexte = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
  const blobVersBase64 = (blob) => new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1]);
    r.onerror = ko;
    r.readAsDataURL(blob);
  });

  async function lireCatalogue() {
    try {
      const f = await gh(`/contents/${FICHIER}?ref=${BRANCHE}`);
      const texte = base64VersTexte(f.content);
      const m = texte.match(/CATALOGUE_ADMIN\s*=\s*([\s\S]*?);\s*$/);
      const cat = m ? JSON.parse(m[1]) : {};
      return { cat: { modifs: cat.modifs || {}, ajouts: cat.ajouts || [] }, sha: f.sha };
    } catch (e) {
      if (e.status === 404) return { cat: { modifs: {}, ajouts: [] }, sha: null };
      throw e;
    }
  }

  const texteCatalogue = (cat) =>
    "// Fichier rempli automatiquement par la page admin.html (photos, prix, nouveaux produits).\n" +
    "// Ne pas modifier à la main : utilisez la page admin.html.\n" +
    "window.CATALOGUE_ADMIN = " + JSON.stringify(cat, null, 1) + ";\n";

  // ---------- Photos : réduction avant envoi ----------
  async function preparerPhoto(fichier) {
    const url = URL.createObjectURL(fichier);
    try {
      const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
      const max = 1200;
      const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * r);
      c.height = Math.round(img.naturalHeight * r);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.85));
      const cle = "__photo:" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      etat.photos[cle] = { blob, url: URL.createObjectURL(blob) };
      return cle;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const srcImage = (image) => etat.photos[image]?.url || etat.apercus[image] || image || "";

  // ---------- Données affichées ----------
  const produits = () => [
    ...etat.base.map((p) => ({ ...p, ...(etat.cat.modifs[p.id] || {}), ajoute: false })).filter((p) => !p.supprime),
    ...etat.cat.ajouts.map((p) => ({ ...p, ajoute: true })),
  ];

  function modifier(id, champs) {
    const ajout = etat.cat.ajouts.find((p) => p.id === id);
    if (ajout) Object.assign(ajout, champs);
    else etat.cat.modifs[id] = { ...(etat.cat.modifs[id] || {}), ...champs };
    for (const [k, v] of Object.entries(etat.cat.modifs[id] || {})) if (v === undefined) delete etat.cat.modifs[id][k];
    etat.modifies.add(id);
    majBarre();
  }

  // ---------- Affichage ----------
  const LIBELLES = { montre: "Montre", parfum: "Parfum", bracelet: "Bracelet", homme: "Homme", femme: "Femme", mixte: "Homme & femme", enfant: "Enfant" };

  function afficher() {
    const q = $("#recherche").value.trim() ? slug($("#recherche").value).replace(/-/g, " ") : "";
    const type = $("#filtre-type").value;
    const liste = produits().filter((p) =>
      (!type || p.type === type) && (!q || slug(`${p.nom} ${p.marque}`).replace(/-/g, " ").includes(q)));
    $("#grille").innerHTML = liste.length ? liste.map((p) => `
      <article class="produit${p.masque ? " masque" : ""}${etat.modifies.has(p.id) ? " modifie" : ""}" data-id="${p.id}">
        <div class="photo">
          <img src="${esc(srcImage(p.image))}" alt="${esc(p.nom)}" loading="lazy">
          ${p.ajoute ? `<span class="etiquette">Ajouté</span>` : p.illustration ? `<span class="etiquette">Photo d'illustration</span>` : ""}
          <label class="btn-photo">📷 Photo<input type="file" accept="image/*" class="choix-photo" hidden></label>
        </div>
        <div class="infos">
          <h3>${esc(p.nom)}</h3>
          <p class="meta">${esc([LIBELLES[p.type], LIBELLES[p.genre], p.marque].filter(Boolean).join(" · "))}</p>
          <label class="prix-ligne">
            <input class="prix" inputmode="numeric" placeholder="Prix sur demande" value="${esc(formatPrix(p.prix))}" aria-label="Prix de ${esc(p.nom)}">
            <span>FCFA</span>
          </label>
          <label class="interrupteur"><input type="checkbox" class="masquer"${p.masque ? " checked" : ""}> Masquer du site</label>
          <div class="actions-produit">
            <button class="btn btn-ligne editer" type="button">✎ Nom, description…</button>
            <button class="btn btn-rouge supprimer" type="button">Supprimer</button>
          </div>
        </div>
      </article>`).join("") : `<p class="vide">Aucun produit trouvé.</p>`;
  }

  function majBarre(message, classe = "") {
    const n = etat.modifies.size;
    const el = $("#etat");
    el.className = "etat " + classe;
    el.textContent = message || (n ? `${n} produit${n > 1 ? "s" : ""} modifié${n > 1 ? "s" : ""}, pas encore publié${n > 1 ? "s" : ""}.` : "Aucune modification.");
    $("#btn-publier").disabled = !n || etat.enCours;
  }

  // ---------- Écran de connexion : logo MT doré (même dessin que sur le site) ----------
  function monogramme() {
    const cx = 66, cy = 50, r = 44;
    const pt = (deg, rr = r) => {
      const a = (deg * Math.PI) / 180;
      return [(cx + Math.sin(a) * rr).toFixed(1), (cy - Math.cos(a) * rr).toFixed(1)];
    };
    const [x1, y1] = pt(-25), [x2, y2] = pt(165);
    const graduations = [0, 30, 60, 90, 120, 150].map((d) => {
      const [ax, ay] = pt(d, d % 90 === 0 ? 34 : 37), [bx, by] = pt(d, 40.5);
      return `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke-width="${d % 90 === 0 ? 3 : 2.2}"/>`;
    }).join("");
    return `
      <svg viewBox="0 0 124 108" aria-hidden="true">
        <defs><linearGradient id="or-connexion" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f7e3a1"/><stop offset=".35" stop-color="#d9ad48"/>
          <stop offset=".6" stop-color="#f3d888"/><stop offset="1" stop-color="#a5741c"/>
        </linearGradient></defs>
        <g stroke="url(#or-connexion)" fill="none" stroke-linecap="round">
          <path d="M${x1} ${y1} A${r} ${r} 0 1 1 ${x2} ${y2}" stroke-width="2.6"/>
          ${graduations}
        </g>
        <rect x="${cx + r + 1}" y="${cy - 6}" width="6" height="12" rx="1.5" fill="url(#or-connexion)"/>
        <text x="2" y="80" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="76" fill="url(#or-connexion)">M</text>
        <text x="47" y="99" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="94" fill="url(#or-connexion)">T</text>
      </svg>`;
  }
  $("#monogramme").innerHTML = monogramme();
  if (typeof IMAGES !== "undefined" && IMAGES.hero)
    $("#connexion").style.setProperty("--fond-connexion", `url("${IMAGES.hero}")`);

  $("#voir-cle").addEventListener("click", () => {
    const champ = $("#cle");
    const visible = champ.type === "password";
    champ.type = visible ? "text" : "password";
    $("#voir-cle").setAttribute("aria-pressed", String(visible));
    $("#voir-cle").setAttribute("aria-label", visible ? "Masquer la clé" : "Afficher la clé");
  });

  // ---------- Connexion ----------
  async function connecter(cle) {
    etat.cle = cle;
    const depot = await gh("");
    if (!depot.permissions?.push) { const e = new Error("lecture seule"); e.status = 403; throw e; }
    const { cat, sha } = await lireCatalogue();
    etat.cat = cat;
    etat.catSha = sha;
    stockage.ecrire(cle);
    $("#connexion").hidden = true;
    document.body.classList.remove("page-connexion");
    $("#gestion").hidden = false;
    $("#barre").hidden = false;
    $("#deconnexion").hidden = false;
    afficher();
    majBarre();
  }

  $("#form-connexion").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#erreur-connexion");
    err.hidden = true;
    const bouton = $(".btn-connexion");
    bouton.disabled = true;
    bouton.textContent = "Connexion…";
    try {
      await connecter($("#cle").value.trim());
    } catch (ex) {
      err.textContent = ex.status === 401 || ex.status === 404 || ex.status === 403
        ? "Clé d'accès incorrecte, expirée ou sans droit d'écriture."
        : "Connexion impossible. Vérifiez votre connexion internet et réessayez.";
      err.hidden = false;
    } finally {
      bouton.disabled = false;
      bouton.textContent = "Se connecter";
    }
  });

  $("#deconnexion").addEventListener("click", () => {
    if (etat.modifies.size && !confirm("Des modifications ne sont pas publiées. Se déconnecter quand même ?")) return;
    stockage.ecrire("");
    etat.modifies.clear();
    location.reload();
  });

  // ---------- Modifications dans la liste ----------
  const idDe = (el) => Number(el.closest(".produit").dataset.id);

  $("#grille").addEventListener("input", (e) => {
    if (e.target.classList.contains("prix")) {
      const id = idDe(e.target);
      modifier(id, { prix: lirePrix(e.target.value) });
      e.target.closest(".produit").classList.add("modifie");
    }
  });

  $("#grille").addEventListener("focusout", (e) => {
    if (e.target.classList.contains("prix")) e.target.value = formatPrix(lirePrix(e.target.value));
  });

  $("#grille").addEventListener("change", async (e) => {
    const id = idDe(e.target);
    if (e.target.classList.contains("masquer")) {
      modifier(id, { masque: e.target.checked || undefined });
      afficher();
    } else if (e.target.classList.contains("choix-photo") && e.target.files[0]) {
      try {
        const cle = await preparerPhoto(e.target.files[0]);
        modifier(id, { image: cle, illustration: false });
        afficher();
      } catch {
        alert("Cette photo n'a pas pu être lue. Essayez une photo au format JPG ou PNG.");
      }
    }
  });

  $("#grille").addEventListener("click", (e) => {
    if (e.target.closest(".editer")) ouvrirFenetre(idDe(e.target));
    if (e.target.closest(".supprimer")) {
      const id = idDe(e.target);
      const p = produits().find((x) => x.id === id);
      if (!p || !confirm(`Supprimer « ${p.nom} » du site ?\n(La suppression sera effective après « Publier sur le site ».)`)) return;
      if (p.ajoute) {
        etat.cat.ajouts = etat.cat.ajouts.filter((x) => x.id !== id);
        etat.modifies.add(id);
        majBarre();
      } else {
        modifier(id, { masque: true, supprime: true });
      }
      afficher();
    }
  });

  $("#recherche").addEventListener("input", afficher);
  $("#filtre-type").addEventListener("change", afficher);

  // ---------- Fenêtre ajout / modification ----------
  const fenetre = $("#fenetre");
  const form = $("#form-produit");
  let photoFenetre = null;

  const majGamme = () => { $("#champ-gamme").hidden = form.type.value !== "montre"; };
  form.type.addEventListener("change", majGamme);

  // Quand on change la marque, la ligne « Marque : … » des caractéristiques suit
  form.marque.addEventListener("input", () => {
    const marque = form.marque.value.trim();
    const lignes = form.details.value.split("\n").filter((l) => !/^\s*marque\s*:/i.test(l));
    if (marque) lignes.unshift("Marque : " + marque);
    form.details.value = lignes.join("\n").replace(/^\n+/, "");
  });

  function ouvrirFenetre(id = null) {
    etat.edition = id;
    const p = id ? produits().find((x) => x.id === id) : null;
    form.reset();
    photoFenetre = p?.image || null;
    $("#titre-fenetre").textContent = p ? "Modifier le produit" : "Ajouter un produit";
    if (p) {
      form.nom.value = p.nom;
      form.type.value = p.type;
      form.genre.value = p.genre;
      form.marque.value = p.marque || "";
      form.gamme.value = p.gamme || "marque";
      form.prix.value = formatPrix(p.prix);
      form.badge.value = p.badge || "";
      form.description.value = p.description || "";
      form.details.value = (p.details || []).join("\n");
    }
    $("#apercu").hidden = !photoFenetre;
    $("#apercu").src = photoFenetre ? srcImage(photoFenetre) : "";
    $("#erreur-produit").hidden = true;
    majGamme();
    fenetre.showModal();
  }

  $("#btn-ajouter").addEventListener("click", () => ouvrirFenetre());
  $("#btn-annuler").addEventListener("click", () => fenetre.close());

  form.photo.addEventListener("change", async () => {
    if (!form.photo.files[0]) return;
    try {
      photoFenetre = await preparerPhoto(form.photo.files[0]);
      $("#apercu").src = srcImage(photoFenetre);
      $("#apercu").hidden = false;
    } catch {
      alert("Cette photo n'a pas pu être lue. Essayez une photo au format JPG ou PNG.");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#erreur-produit");
    const nom = form.nom.value.trim();
    if (!nom || !photoFenetre) {
      err.textContent = !nom ? "Indiquez le nom du produit." : "Choisissez une photo.";
      err.hidden = false;
      return;
    }
    const type = form.type.value;
    const marque = form.marque.value.trim() || (type === "parfum" ? "Parfums" : type === "bracelet" ? "Bracelets" : "");
    const champs = {
      nom, marque, type, genre: form.genre.value,
      gamme: type === "montre" ? form.gamme.value : undefined,
      prix: lirePrix(form.prix.value),
      image: photoFenetre,
      badge: form.badge.value.trim() || undefined,
      description: form.description.value.trim() || `${nom}, disponible en boutique à La Maison du Temps.`,
      details: form.details.value.split("\n").map((l) => l.trim()).filter(Boolean),
    };
    if (!champs.details.length)
      champs.details = [marque && `Marque : ${marque}`, LIBELLES[type] + " " + LIBELLES[form.genre.value].toLowerCase(), "Disponible en boutique"].filter(Boolean);
    const estAjout = etat.cat.ajouts.some((p) => p.id === etat.edition);
    if (etat.edition && !estAjout) {
      // Produit d'origine : une étiquette vidée est bien retirée du site
      champs.badge = champs.badge || "";
      const base = etat.base.find((p) => p.id === etat.edition);
      if (champs.image !== base.image) champs.illustration = false;
      if (base.gamme && champs.gamme === undefined) champs.gamme = null;
      modifier(etat.edition, champs);
    } else if (etat.edition) {
      modifier(etat.edition, champs);
    } else {
      const id = Math.max(999, ...produits().map((p) => p.id)) + 1;
      etat.cat.ajouts.unshift({ id, ...champs, note: 4.8 });
      etat.modifies.add(id);
      majBarre();
      $("#recherche").value = "";
      $("#filtre-type").value = "";
    }
    for (const p of etat.cat.ajouts) for (const k of Object.keys(p)) if (p[k] === undefined) delete p[k];
    fenetre.close();
    afficher();
  });

  // ---------- Publication ----------
  $("#btn-publier").addEventListener("click", async () => {
    etat.enCours = true;
    majBarre("Publication en cours… ne fermez pas la page.");
    try {
      // 1. Vérifier que personne d'autre n'a publié entre-temps
      const ref = await gh(`/git/ref/heads/${BRANCHE}`);
      const dernier = await gh(`/git/commits/${ref.object.sha}`);
      const actuel = await lireCatalogue();
      if (actuel.sha !== etat.catSha) {
        majBarre("Le catalogue a été modifié ailleurs entre-temps. Rechargez la page puis refaites vos changements.", "ko");
        return;
      }

      // 2. Envoyer les nouvelles photos utilisées
      const cat = JSON.parse(JSON.stringify(etat.cat));
      const elements = [...Object.values(cat.modifs), ...cat.ajouts];
      const arbre = [];
      const remplacements = {};
      for (const el of elements) {
        const photo = etat.photos[el.image];
        if (!photo) continue;
        if (!remplacements[el.image]) {
          const nom = el.nom || etat.base.find((p) => cat.modifs[p.id] === el)?.nom || "produit";
          const chemin = `images/produits/${slug(nom)}-${Date.now().toString(36)}${arbre.length}.jpg`;
          const blob = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: await blobVersBase64(photo.blob), encoding: "base64" }) });
          arbre.push({ path: chemin, mode: "100644", type: "blob", sha: blob.sha });
          remplacements[el.image] = chemin;
          etat.apercus[chemin] = photo.url;
        }
        el.image = remplacements[el.image];
      }

      // 3. Enregistrer le catalogue et publier en une seule fois
      const blobCat = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: texteCatalogue(cat), encoding: "utf-8" }) });
      arbre.push({ path: FICHIER, mode: "100644", type: "blob", sha: blobCat.sha });
      const nouvelArbre = await gh("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: dernier.tree.sha, tree: arbre }) });
      const n = etat.modifies.size;
      const commit = await gh("/git/commits", { method: "POST", body: JSON.stringify({
        message: `Espace gestion : ${n} produit${n > 1 ? "s" : ""} mis à jour (photos / prix)`,
        tree: nouvelArbre.sha,
        parents: [ref.object.sha],
      }) });
      await gh(`/git/refs/heads/${BRANCHE}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });

      etat.cat = cat;
      etat.catSha = blobCat.sha;
      etat.modifies.clear();
      afficher();
      majBarre("✓ Publié ! Le site sera à jour dans 1 à 2 minutes.", "ok");
    } catch (ex) {
      majBarre(ex.status === 401 ? "Clé d'accès expirée : déconnectez-vous et reconnectez-vous." :
        ex.status === 422 || ex.status === 409 ? "Le site a été modifié en même temps. Rechargez la page puis réessayez." :
        "La publication a échoué (connexion internet ?). Réessayez.", "ko");
    } finally {
      etat.enCours = false;
      $("#btn-publier").disabled = !etat.modifies.size;
    }
  });

  window.addEventListener("beforeunload", (e) => {
    if (etat.modifies.size) { e.preventDefault(); e.returnValue = ""; }
  });

  // ---------- Démarrage : reconnexion automatique ----------
  const cleEnregistree = stockage.lire();
  if (cleEnregistree) {
    $("#cle").value = cleEnregistree;
    connecter(cleEnregistree).catch(() => { stockage.ecrire(""); $("#cle").value = ""; });
  }
})();
