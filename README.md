# 📊 Finance App
Money Wise est une application web développée en Java Spring Boot et MySQL, permettant de gérer des abonnements et de suivre les paiements.

## 🚀 Fonctionnalités principales
- Une page d'acceuil montrant l'intégralité des infos sur votre gestion financière
- Création d'abonnements (dépenses uniques chaque mois), qui pourront être crées automatiquement chaque mois
- Créer, modifier et supprimer les dépenses financières effectués
- Statistiques des dépenses

## 🛠️ Technologies utilisées
- Backend : Java 21, Spring Boot
- Base de données : MySQL
- API REST : Contrôleurs Spring (@RestController)
- Frontend : JavaScript (fetch API pour la communication), HTML, CSS

## 📂 Structure rapide
- /controller : Gère les routes API (ex: /api/subscription)
- /model : Définit les entités (Subscription, Description, etc.)
- /repository : Contient les interfaces pour accéder aux données MySQL
- /DTO : (optionnel) pour certaines réponses spécifiques (ex: regroupement par mois)

## 📜 Licence
Projet personnel réalisé pour l'apprentissage et l'amélioration continue.
Feel free to fork, contribute or suggest improvements!
