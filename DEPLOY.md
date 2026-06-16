# Déploiement — DadDrop

Stack : Next.js 16 (Turbopack) + Supabase. Déploiement zéro-config sur Vercel.

## 1. Supabase (base de données + stockage)

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Ouvre **SQL Editor** et exécute le contenu de [`supabase_schema.sql`](./supabase_schema.sql).
   Ça crée les tables `cards` + `events`, les index, le bucket `card-photos` et les policies RLS.
3. Récupère les clés dans **Project Settings → API** :
   - `NEXT_PUBLIC_SUPABASE_URL` → *Project URL*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → *anon public*
   - `SUPABASE_SERVICE_ROLE_KEY` → *service_role* (secrète)

## 2. GitHub

Pousse le repo sur GitHub (Vercel se branche dessus) :

```bash
gh repo create daddrop --private --source=. --push
# ou : git remote add origin <url> && git push -u origin main
```

## 3. Vercel

1. Sur [vercel.com](https://vercel.com) → **Add New Project** → importe le repo GitHub.
2. Framework détecté automatiquement : **Next.js**. Aucun réglage de build à changer.
3. **Environment Variables** — ajoute les 4 clés (voir `.env.example`) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_BASE_URL` → laisse vide au 1er déploiement, puis **remplis avec l'URL Vercel finale** (ex. `https://daddrop.vercel.app`) et redéploie. C'est l'URL utilisée dans les liens de cartes partagés.
4. **Deploy.**

## 4. Vérification post-déploiement (test bout-en-bout)

- [ ] La landing s'ouvre sur mobile
- [ ] Créer une carte → un lien `…/card/xxxxxxx` est généré
- [ ] Ouvrir le lien depuis **un autre appareil/navigateur** → l'animation se joue
- [ ] L'upload photo fonctionne (vérifie le bucket `card-photos` dans Supabase)
- [ ] Les 6 événements remontent : Supabase → **Table Editor → events**

### Requêtes de pilotage (Supabase SQL Editor)

```sql
-- Funnel global
select type, count(*) from events group by type order by 2 desc;

-- Taux de partage (LA métrique) = card_opened / create_completed
select
  (select count(*) from events where type = 'card_opened')::float
  / nullif((select count(*) from events where type = 'create_completed'), 0) as taux_partage;

-- Taux de boucle = loop_create_started / card_opened
select
  (select count(*) from events where type = 'loop_create_started')::float
  / nullif((select count(*) from events where type = 'card_opened'), 0) as taux_boucle;
```
