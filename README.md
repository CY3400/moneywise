# 📊 Money Wise

Money Wise est une application web développée en Java Spring Boot et MySQL, permettant de gérer des abonnements et de suivre les paiements.

## 🚀 Fonctionnalités principales
- Une page d'accueil montrant l'intégralité des informations sur votre gestion financière.
- Création d'abonnements (dépenses récurrentes chaque mois), qui pourront être créés automatiquement.
- Création, modification et suppression des dépenses financières effectuées.
- Statistiques des dépenses sous forme de graphiques.

## 🛠️ Technologies utilisées
- **Back-End** : Java 21, Spring Boot
- **Base de données** : MySQL
- **API REST** : Contrôleurs Spring (@RestController)
- **Front-End** : JavaScript (fetch API pour la communication), HTML, CSS

## 📂 Structure du projet
- `/controller` : Gère les routes API (ex : `/api/subscription`)
- `/model` : Définit les entités (Subscription, Description, etc.)
- `/repository` : Contient les interfaces pour accéder aux données MySQL
- `/dto` : (optionnel) pour certaines réponses spécifiques (ex : regroupement des dépenses par mois)

## 📜 Licence
Projet personnel réalisé dans le cadre de l'apprentissage et de l'amélioration continue.  
N'hésitez pas à forker, contribuer ou proposer des améliorations !

## 📸 Aperçu de l'application
### Page d'accueil
![Page d'accueil](screenshots/home_page.png)
### Création d'un abonnement
![Création d'un abonnement](screenshots/create_subscription.png)
### Statistiques des dépenses
![Statistiques des dépenses](screenshots/expense_stats.png)
