# SPEC.md — Projet « carte/expérience par lien » — MVP Fête des Pères

> Nom du projet : *à définir* (placeholder : **DadDrop**).
> Statut : MVP de test, gratuit, sans monétisation.
> Échéance dure : **Fête des Pères France = dimanche 21 juin 2026** (3ᵉ dimanche de juin).

---

## 0. Contexte & stratégie en 2 phases

**Phase 1 — MVP gratuit (ce document).** Utiliser la fête des pères comme terrain d'essai pour valider la mécanique de base : *créer → partager un lien → le proche ouvre une expérience personnalisée*. Objectif = **mesurer la réceptivité**, pas générer du revenu.

**Phase 2 — Produit payant (hors scope, voir §7).** Généraliser à toutes les occasions (anniversaire, fête des mères, Noël…) et ajouter les features premium qui justifient le paiement.

**Pourquoi c'est malin :** le MVP teste *exactement* le cœur du futur produit payant. Rien n'est jeté.

### Objectif de succès du test
Le test réussit s'il produit **un signal de réceptivité**, mesuré de deux façons :
1. **Signal "clip"** (le plus rapide) : un TikTok de démo génère des commentaires de curiosité type « c'est quoi ce site ?? ».
2. **Signal "produit"** : les gens qui créent une carte la partagent réellement, et une partie des destinataires créent la leur (boucle virale).

### Ce que le test n'est PAS
Pas un objectif de chiffre d'affaires. Pas une preuve statistique robuste (le volume sera petit en 6 jours sans audience). C'est un **apprentissage** : la mécanique accroche-t-elle, et le build est-il maîtrisé pour la v2 ?

---

## 1. Principe directeur : scope IMPITOYABLE

En 6 jours, le seul vrai danger c'est de coder trop. Règles non négociables :

- **Une seule template, une seule mécanique, faite parfaitement.** Pas de choix de thèmes.
- **Pas d'inscription.** Aucun compte, aucun login.
- **Mobile-first.** La cible ouvre le lien sur son téléphone.
- **L'animation de révélation reçoit 80 % de l'effort de polish.** C'est elle qui rend le produit filmable et partageable (voir §4). Le reste peut être minimal.
- Toute idée « ce serait cool d'ajouter… » → notée pour la v2, **pas codée** cette semaine.

---

## 2. PARTIE 1 — Cahier des charges du MVP

### 2.1 Parcours utilisateur

**Flux Créateur** (l'enfant qui prépare la surprise) — 3 écrans max :
1. **Landing** — hook émotionnel + CTA « Crée une surprise pour ton papa » + lien vers une démo.
2. **Personnalisation** — un message texte, une photo optionnelle, le prénom de l'expéditeur (et éventuellement du papa).
3. **Lien généré** — aperçu + boutons copier / partager. Fin.

**Flux Destinataire** (le papa qui ouvre) :
1. **Ouverture du lien** — court teaser / chargement qui crée l'attente.
2. **Animation de révélation** — *la star du produit* (voir §4).
3. **Message affiché** — le contenu personnalisé.
4. **CTA doux** — « Crée la tienne » → renvoie au flux Créateur. **C'est la boucle virale.**

### 2.2 Écrans détaillés

| Écran | Contenu | Notes |
|---|---|---|
| Landing | Titre accrocheur, sous-titre, CTA principal, lien démo, exemples visuels | Doit charger vite, donner envie en 3 s |
| Personnalisation | Champ message (limite ~280 car. pour le MVP), upload photo optionnel, prénom expéditeur | Validation minimale, pas de friction |
| Lien généré | URL courte, bouton « Copier », partage natif (Web Share API), aperçu de la carte | Le partage natif mobile est clé |
| Révélation (destinataire) | Teaser → animation → message → photo | 80 % du polish ici |
| CTA boucle | « Crée la tienne pour quelqu'un » | Mesuré comme événement |

### 2.3 Modèle de données (minimal)

```
Card
  id            string  (slug court, ex. 7 caractères, URL-safe)
  created_at    datetime
  sender_name   string
  recipient_name string?   (optionnel)
  message       text
  photo_url     string?   (nullable)
  theme         string    (fixé à "fete_des_peres" pour le MVP)

Event
  id            string
  card_id       string?   (nullable : la landing n'a pas de carte)
  type          enum      (voir §2.4)
  created_at    datetime
  session_id    string    (cookie/anonyme, pour distinguer créateur vs destinataire)
  source        string?   (utm / referrer, pour savoir d'où vient le trafic)
```

Garder ça léger. Stockage serveur classique (Postgres/SQLite/peu importe). Slugs courts pour des liens propres.

### 2.4 Événements à tracker — **À FAIRE DÈS LE JOUR 1**

Sans instrumentation, le test n'apprend rien. Événements à logguer (base maison, PostHog ou Plausible — peu importe l'outil) :

| Événement | Déclenchement | Sert à mesurer |
|---|---|---|
| `landing_view` | arrivée sur la landing (+ `source`) | trafic & origine |
| `create_started` | ouverture de l'écran de perso | début d'intention |
| `create_completed` | carte créée + lien généré | **taux de complétion de création** |
| `card_opened` | lien ouvert par une session ≠ créateur | **taux de partage (LA métrique virale)** |
| `reveal_completed` | animation regardée jusqu'au bout | engagement émotionnel |
| `loop_create_started` | destinataire clique « Crée la tienne » | **coefficient viral** |

**Formules de pilotage :**
- Taux de complétion = `create_completed` / `landing_view`
- **Taux de partage** = `card_opened` (par un tiers) / `create_completed` ← *la plus importante*
- Taux de boucle = `loop_create_started` / `card_opened`

> Règle d'or : si les gens créent mais que **personne n'ouvre** (`card_opened` ≈ 0), le concept est mort, quel que soit le reste.

### 2.5 Stack & contraintes techniques

- **Stack** : *à compléter selon ton choix* (Next.js, SvelteKit, Remix… au choix). Tout est faisable en full-stack web classique.
- **Performance** : la révélation doit sembler **instantanée**. Précharger les assets, viser un Time-to-Interactive très bas sur mobile 4G.
- **Liens courts** : slugs courts et propres (les gens vont les coller dans des messages).
- **Upload photo** : gérer le redimensionnement côté client avant envoi (éviter les 8 Mo de photo). Stockage simple (S3/Cloudinary/local selon ton infra).
- **Analytics** : événements §2.4 obligatoires avant le lancement.
- **Watermark** : prévoir un emplacement discret (utile pour la notoriété ET pour la v2 où on le retire contre paiement).
- **Pas d'auth, pas de paiement** dans le MVP.

### 2.6 Hors scope MVP (= matière pour la v2)
Paiement · comptes utilisateurs · choix de thèmes multiples · musique · montage vidéo · contribution collaborative de la famille · messages multi-étapes · autres occasions. **Ne rien coder de tout ça cette semaine.**

### 2.7 Definition of Done (MVP)
- [ ] Un créateur peut générer une carte personnalisée sans inscription
- [ ] Le lien s'ouvre sur mobile et déclenche l'animation de révélation
- [ ] Le CTA « Crée la tienne » fonctionne et est tracké
- [ ] Les 6 événements de §2.4 remontent correctement
- [ ] L'animation de révélation est fluide (60 fps) et satisfaisante à filmer
- [ ] Chargement rapide sur mobile

---

## 3. PARTIE 2 — Script du clip TikTok (test de réceptivité)

**But unique : provoquer des commentaires « c'est quoi ce site ?? ».** C'est le signal de réceptivité le plus rapide et le moins cher. À poster **même avant que le produit soit 100 % fini**.

### 3.1 Format
- Vertical 9:16, ~15 secondes.
- Le **payoff = la révélation** (et idéalement la réaction du papa).
- Son tendance + texte à l'écran. Pas de CTA agressif (l'algo n'aime pas, et la curiosité fait plus de commentaires qu'un lien).

### 3.2 Structure (règle des 3 temps)
1. **Hook (0–2 s)** : une phrase qui crée la tension. Ex. texte à l'écran : « J'ai envoyé ça à mon père pour la fête des pères 🥹 ».
2. **Build (2–8 s)** : on voit l'écran du téléphone, le lien qui s'ouvre, l'attente.
3. **Payoff (8–15 s)** : **la révélation à l'écran** + plan sur la tête du papa. C'est le moment qui fait le clip.

### 3.3 Deux variantes à tester (A/B)

**Variante A — Émotion (tire-larme)**
```
[0-2s]  Texte : "J'ai pas pu lui dire en face alors..."
        Plan : on tend le téléphone à papa
[2-8s]  Le lien s'ouvre, l'animation démarre, montée d'attente
        Musique douce qui monte
[8-15s] La révélation se dévoile + message perso
        Gros plan : papa qui sourit / s'émeut
        Texte : "(lien en bio est pas obligatoire — laisse-les demander)"
```

**Variante B — Humour (dad jokes)**
```
[0-2s]  Texte : "POV : tu veux humilier ton père avec amour"
        Plan : téléphone tendu à papa
[2-8s]  L'animation démarre, attente comique
[8-15s] Révélation type "Diplôme du Roi du barbecue / des blagues nulles"
        Réaction de papa qui rigole
        Texte : "il a adoré (je crois)"
```

### 3.4 Notes de diffusion
- Poster **plusieurs variantes** (≥ 3) sur quelques jours, pas une seule.
- Hashtags mixtes : gros (#fetedespères #papa) + niche (#diy #surprise).
- **Le signal à surveiller** : commentaires « c'est quoi ?? », « comment on fait ça ?? », taux de sauvegarde/partage élevé. Le nombre de vues brut compte moins que le **taux de commentaires curieux**.
- Mettre le lien du produit en bio pour récupérer les curieux → leur visite alimente `landing_view` avec `source`.

---

## 4. PARTIE 3 — L'animation de révélation

**Pourquoi elle est centrale :** c'est *à la fois* le cœur de l'émotion (la réaction du papa), le moteur de partage (les autres veulent le refaire) et le contenu du clip viral. Si une seule chose doit être parfaite, c'est elle.

### 4.1 Principes de design
1. **Anticipation** : créer l'attente avant le dévoilement (ne pas tout montrer d'un coup).
2. **Révélation progressive** : un dévoilement satisfaisant, avec un rythme (montée → climax).
3. **Récompense émotionnelle** : le message/photo apparaît au pic.
4. **Mouvement satisfaisant** : easing soigné, fluide, pas saccadé.
5. **Pensé mobile & filmable** : lisible sur petit écran, beau en vidéo de 15 s.

### 4.2 Séquence proposée (exemple : ouverture de cadeau/enveloppe)

| Temps | Beat | Détail |
|---|---|---|
| 0–1 s | Teaser | Écran sombre + invite « Appuie pour ouvrir » + élément qui pulse |
| 1–2 s | Anticipation | Au tap : légère vibration (haptique), l'objet (enveloppe/paquet) tremble |
| 2–4 s | Ouverture | L'enveloppe s'ouvre / le paquet se déballe avec une animation fluide |
| 4–5 s | Climax | Burst de particules / confettis, transition lumineuse |
| 5–7 s | Récompense | Le message personnalisé apparaît en fondu, puis la photo |
| +     | Repos | CTA doux « Crée la tienne » apparaît après quelques secondes |

> Le choix exact (enveloppe, cadeau, rideau qui s'ouvre, boîte) est secondaire — ce qui compte c'est le **rythme anticipation → climax → récompense**.

### 4.3 Notes techniques
- **Léger** : privilégier CSS transforms + transitions / `requestAnimationFrame`. Pas besoin d'une grosse lib 3D.
- **60 fps** sur mobile : animer `transform` et `opacity` (pas `width`/`top`), éviter les reflows.
- Haptique : `navigator.vibrate()` au tap (là où supporté) renforce le moment.
- Précharger l'image perso **avant** de jouer l'animation pour éviter un flash de chargement au climax.
- Confettis : une petite lib légère ou un canvas maison suffit.

### 4.4 Checklist « est-ce filmable ? »
- [ ] La révélation est-elle satisfaisante à regarder dans un clip de 15 s ?
- [ ] Y a-t-il un moment « climax » clair et net (le beat qu'on attend) ?
- [ ] Est-ce lisible et beau sur un petit écran filmé de biais ?
- [ ] Donne-t-elle envie de la refaire pour quelqu'un d'autre ?

---

## 5. Métriques de succès du test (go / no-go)

> Volume faible attendu en 6 jours → ces seuils sont **directionnels**, pas du dogme.

| Signal | Vert (réceptif) | Rouge (à revoir) |
|---|---|---|
| Clip TikTok | commentaires « c'est quoi ?? », bon taux de sauvegarde | clips ignorés après plusieurs essais |
| Taux de partage (`card_opened`/`create_completed`) | élevé (les gens créent *pour* envoyer → attendu fort) | proche de 0 → concept mort |
| Taux de boucle (`loop_create_started`/`card_opened`) | même 5–10 % en test à froid = prometteur | 0 % |
| Complétion création | la majorité finissent ce qu'ils commencent | abandon massif à la perso |

**Décision :** signal clip positif **OU** taux de partage + boucle corrects → on construit la v2. Sinon → on change l'angle/la mécanique pour quasi zéro coût engagé.

---

## 6. Planning 6 jours (suggestion)

| Jour | Focus |
|---|---|
| J1 | Scope figé, modèle de données, génération de lien + slug, instrumentation des événements |
| J2 | Flux créateur (3 écrans) + stockage carte + upload photo |
| J3 | Flux destinataire + **animation de révélation v1** |
| J4 | Polish de l'animation (le cœur) + CTA boucle + responsive mobile |
| J5 | Tournage des clips TikTok + tests bout-en-bout + vérif des événements |
| J6 | Diffusion des clips, mise en ligne, observation des métriques |

> En parallèle dès J3-J4 : poster les premiers clips de démo *sans attendre* la fin du produit (le test clip est indépendant).

---

## 7. Roadmap v2 (payante) — pour mémoire

- **Généralisation** : toutes les occasions (anniversaire, fête des mères, Noël, Saint-Valentin…).
- **Features premium** : message plus long / multi-étapes, musique, photos multiples, montage, **contribution collaborative de la famille** (chaque membre ajoute via le lien → boucle virale renforcée).
- **Monétisation** au moment de l'émotion max : débloquer la version finale en HD, retirer le watermark, thèmes premium, crédits/coins à la PlanYour.Date, voir les réponses (pour les formats anonymes).
- La fête des pères devient un **pic marketing annuel**, plus un produit mort le 22 juin.

---

*Document de travail — à itérer. Sections à compléter : nom définitif du projet, stack technique retenue.*
