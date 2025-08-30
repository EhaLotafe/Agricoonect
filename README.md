
# 🌱 AgriConnect Marketplace

Une plateforme de mise en relation agricole entre agriculteurs, acheteurs et administrateurs.  
Elle permet aux agriculteurs de publier leurs produits, aux acheteurs d'accéder facilement aux offres, et aux admins de gérer la plateforme.

---

## 🚀 Fonctionnalités

- 🏡 Accueil avec aperçu des produits
- 🛒 Catalogue produits avec détails par produit
- 👩‍🌾 Tableau de bord Agriculteur (ajout / gestion des produits)
- 🧑‍💼 Tableau de bord Acheteur (commandes, suivi)
- 🛠️ Tableau de bord Admin (gestion utilisateurs et produits)
- 🔐 Authentification (inscription / connexion)
- ✅ Routes protégées selon rôle (Farmer / Buyer / Admin)
- 💬 Notifications & messages
- 🎨 Interface moderne avec React + Tailwind CSS

---

## 🏗️ Technologies utilisées

### Frontend
- [React + Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Wouter](https://github.com/molefrog/wouter) (routing léger)
- [TanStack Query](https://tanstack.com/query) (data fetching)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (UI components)
- [Lucide Icons](https://lucide.dev/)

### Backend
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/) avec [PostgreSQL](https://www.postgresql.org/)
- [Passport.js](http://www.passportjs.org/) (authentification)

---

## 📂 Structure du projet

AgriConnectMarketplace/  │── client/          # Frontend React │    ├── src/ │   │   ├── pages/   # Pages principales │   │   ├── components/ # Composants UI │   │   ├── context/ # Auth context │   │   └── App.tsx  # Router & App principale │ │── server/          # Backend Express + TypeScript │   ├── db.ts        # Connexion DB │   ├── auth.ts      # Auth avec Passport │   ├── routes/      # Routes API │   └── index.ts     # Serveur principal │ │── README.md        # Ce fichier ✨

---

## ⚙️ Installation & lancement

### 1️⃣ Cloner le projet
`bash
git clone https://github.com/<USERNAME>/<REPO>.git
cd AgriConnectMarketplace

2️⃣ Installer les dépendances

Frontend

cd client
npm install

Backend

cd ../server
npm install

3️⃣ Configurer les variables d’environnement

Créer un fichier .env dans server/ :

DATABASE_URL=postgresql://user:password@localhost:5432/agriconnect
JWT_SECRET=ton_secret

4️⃣ Lancer le projet

Démarrer le backend

cd server
npm run dev

Démarrer le frontend

cd ../client
npm run dev

L’app est disponible sur 👉 http://localhost:5173


---

👤 Rôles disponibles

Farmer (Agriculteur) : gère ses produits

Buyer (Acheteur) : consulte et achète

Admin (Administrateur) : supervision et gestion globale



---

📌 Prochaines améliorations

📱 Application mobile (React Native / Expo)

💳 Intégration paiement en ligne

🌍 Multilingue (FR / EN / Swahili)

📊 Statistiques avancées (ventes, tendances)



---

📝 Licence

Ce projet est open-source sous licence MIT.
Tu peux l’utiliser, le modifier et le partager librement.


---

👨‍💻 Développé avec ❤️ par Eha LOTAFE / Overcome Solutions
