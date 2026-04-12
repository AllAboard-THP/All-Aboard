puts "Resetting AllAboard demo data..."

Message.destroy_all
ConversationParticipant.destroy_all
Conversation.destroy_all
Bookmark.destroy_all
Like.destroy_all
Comment.destroy_all
PostTag.destroy_all
Post.destroy_all
ResourceTag.destroy_all
Tag.destroy_all
Resource.destroy_all
Event.destroy_all
EventCandidate.destroy_all
SubjectRequest.destroy_all
MentorSubject.destroy_all
Subject.destroy_all
User.destroy_all

# ——— SUBJECTS ———

subjects = [
  {
    name: "HTML / CSS",
    slug: "html-css",
    description: "Intégration web, flexbox, grid, animations, responsive design...",
    icon: "fa-code",
    accent_color: "#f97316"
  },
  {
    name: "JavaScript",
    slug: "javascript",
    description: "ES6+, DOM, async/await, React, Vue, Node.js...",
    icon: "fa-js",
    accent_color: "#facc15"
  },
  {
    name: "Python",
    slug: "python",
    description: "Scripts, Django, Flask, data science, automatisation...",
    icon: "fa-python",
    accent_color: "#60a5fa"
  },
  {
    name: "Ruby / Rails",
    slug: "ruby-rails",
    description: "Ruby, Ruby on Rails, MVC, ActiveRecord, Hotwire...",
    icon: "fa-gem",
    accent_color: "#f87171"
  },
  {
    name: "Bases de données",
    slug: "bases-de-donnees",
    description: "SQL, PostgreSQL, MySQL, NoSQL, modélisation, requêtes...",
    icon: "fa-database",
    accent_color: "#a78bfa"
  },
  {
    name: "Intelligence Artificielle",
    slug: "intelligence-artificielle",
    description: "Machine learning, deep learning, LLMs, prompt engineering...",
    icon: "fa-brain",
    accent_color: "#4ade80"
  },
  {
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    description: "Docker, CI/CD, Kubernetes, AWS, déploiement, Linux...",
    icon: "fa-cloud",
    accent_color: "#22d3ee"
  },
  {
    name: "Cybersécurité",
    slug: "cybersecurite",
    description: "OWASP, pentest, CTF, cryptographie, Kali Linux...",
    icon: "fa-shield-halved",
    accent_color: "#c084fc"
  }
].map { |attrs| Subject.create!(attrs) }.index_by(&:slug)

# ——— USERS ———

admin = User.create!(
  email: "admin@allaboard.test",
  password: "Admin1234!",
  full_name: "Admin AllAboard",
  headline: "Administrateur de la plateforme",
  education_level: "N/A",
  bio: "Compte administrateur. Gestion de la plateforme, modération et contenu.",
  avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  role: "admin"
)

# Mentors
lucas = User.create!(
  email: "lucas@allaboard.test",
  password: "Lucas1234!",
  full_name: "Lucas M.",
  headline: "Ingénieur full-stack — Mentor JS & Ruby on Rails",
  education_level: "Master Informatique",
  bio: "5 ans d'expérience en développement web. Je partage mes connaissances sur React, Ruby on Rails, les APIs REST et les bonnes pratiques de code.",
  avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  rating: 4.9,
  mentor: true
)

sofia = User.create!(
  email: "sofia@allaboard.test",
  password: "Sofia1234!",
  full_name: "Sofia T.",
  headline: "Data Engineer — Mentor Python & IA",
  education_level: "Master Data Science",
  bio: "Spécialisée en machine learning et pipelines de données. J'aide sur Python, pandas, scikit-learn et les LLMs. Passionnée par l'IA éthique.",
  avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  rating: 4.8,
  mentor: true
)

# Étudiants / développeurs juniors
hugo = User.create!(
  email: "hugo@allaboard.test",
  password: "Hugo1234!",
  full_name: "Hugo B.",
  headline: "BTS SIO — Développement d'applications web",
  education_level: "BTS SIO",
  bio: "En formation dev web. Je travaille sur des projets React et commence Rails. Passionné par la cybersécurité.",
  avatar_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
  rating: 4.3
)

camille = User.create!(
  email: "camille@allaboard.test",
  password: "Camille1234!",
  full_name: "Camille R.",
  headline: "Licence Informatique — Spécialisation IA",
  education_level: "Licence 3 Informatique",
  bio: "Je me spécialise en intelligence artificielle. Je bidouille des modèles PyTorch et explore le prompt engineering.",
  avatar_url: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100&h=100&fit=crop",
  rating: 4.5
)

thomas = User.create!(
  email: "thomas@allaboard.test",
  password: "Thomas1234!",
  full_name: "Thomas D.",
  headline: "Autodidacte — Python & DevOps",
  education_level: "Autodidacte",
  bio: "Reconversion depuis 1 an. Je maîtrise Python, Linux et commence Docker/Kubernetes. Toujours prêt à partager.",
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  rating: 4.6
)

marie = User.create!(
  email: "marie@allaboard.test",
  password: "Marie1234!",
  full_name: "Marie L.",
  headline: "Développeuse front-end junior — HTML/CSS/JS",
  education_level: "Bootcamp Le Wagon",
  bio: "Sortie du Wagon il y a 3 mois. Je perfectionne mon CSS, j'apprends React et je cherche mon premier poste.",
  avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  rating: 4.4
)

all_users = { admin: admin, lucas: lucas, sofia: sofia, hugo: hugo, camille: camille, thomas: thomas, marie: marie }

# ——— COMPETENCES (mentors) ———

lucas_subjects = Subject.where(slug: ["javascript", "ruby-rails", "html-css"])
sofia_subjects  = Subject.where(slug: ["python", "intelligence-artificielle", "bases-de-donnees"])

lucas_subjects.each { |s| lucas.competences << s }
sofia_subjects.each  { |s| sofia.competences << s }

# ——— POSTS ———

posts = []

posts << Post.new(
  user: hugo,
  subject: subjects["javascript"],
  title: "Problème avec React useEffect et boucle infinie",
  body: "Mon composant re-render en boucle à cause de useEffect. Je comprends pas pourquoi mon state se met à jour sans arrêt alors que je n'ai rien changé dans les dépendances...",
  code_snippet: "useEffect(() => {\n  fetchData();\n}, [data]); // data change à chaque render !",
  code_language: "javascript",
  urgent: true,
  education_level: "BTS SIO",
  tag_list: "React, Hooks, useEffect",
  created_at: 2.hours.ago
)

posts << Post.new(
  user: marie,
  subject: subjects["html-css"],
  title: "Mon flexbox ne centre pas verticalement sur mobile",
  body: "J'essaie de centrer un élément verticalement avec flexbox mais ça marche sur desktop et pas sur mobile. J'ai pourtant mis align-items: center et justify-content: center...",
  code_snippet: ".container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100vh; /* le problème vient peut-être de là ? */\n}",
  code_language: "css",
  urgent: false,
  education_level: "Bootcamp",
  tag_list: "CSS, Flexbox, Responsive",
  created_at: 5.hours.ago
)

posts << Post.new(
  user: thomas,
  subject: subjects["python"],
  title: "KeyError sur un dictionnaire — je comprends pas pourquoi",
  body: "Mon script plante avec KeyError alors que j'ai vérifié que la clé existe. Le problème arrive seulement quand je parse un fichier JSON externe.",
  code_snippet: "data = json.load(f)\nprint(data['user']['email'])  # KeyError: 'user'",
  code_language: "python",
  urgent: true,
  education_level: "Autodidacte",
  tag_list: "Python, JSON, Dictionnaire",
  created_at: 1.day.ago
)

posts << Post.new(
  user: camille,
  subject: subjects["intelligence-artificielle"],
  title: "Comment éviter l'overfitting sur mon modèle PyTorch ?",
  body: "Mon modèle de classification a 97% d'accuracy sur le train set mais seulement 63% sur le test set. J'ai essayé de réduire les epochs mais le gap reste énorme.",
  code_snippet: "# Architecture actuelle\nself.fc1 = nn.Linear(784, 512)\nself.fc2 = nn.Linear(512, 256)\nself.fc3 = nn.Linear(256, 10)\n# Pas de dropout ni de batch norm",
  code_language: "python",
  urgent: false,
  education_level: "Licence 3",
  tag_list: "PyTorch, Overfitting, Deep Learning",
  created_at: 9.hours.ago
)

posts << Post.new(
  user: hugo,
  subject: subjects["devops-cloud"],
  title: "Mon container Docker ne trouve pas l'image en production",
  body: "En local ça tourne parfaitement mais sur le serveur de prod j'ai une erreur 'image not found'. J'utilise docker-compose et l'image est sur Docker Hub.",
  code_snippet: "version: '3'\nservices:\n  app:\n    image: monuser/monapp:latest\n    ports:\n      - '3000:3000'\n# Error: No such image: monuser/monapp:latest",
  code_language: "yaml",
  urgent: true,
  education_level: "BTS SIO",
  tag_list: "Docker, Docker Hub, Production",
  created_at: 3.hours.ago
)

posts << Post.new(
  user: marie,
  subject: subjects["ruby-rails"],
  title: "Différence entre has_many :through et has_and_belongs_to_many ?",
  body: "Dans Rails, j'hésite entre has_many :through et has_and_belongs_to_many pour une relation Users ↔ Projets. Quelle est la bonne pratique et dans quel cas utiliser l'un vs l'autre ?",
  code_snippet: "# Option A\nclass User < ApplicationRecord\n  has_many :participations\n  has_many :projects, through: :participations\nend\n\n# Option B\nclass User < ApplicationRecord\n  has_and_belongs_to_many :projects\nend",
  code_language: "ruby",
  urgent: false,
  education_level: "Bootcamp",
  tag_list: "Rails, ActiveRecord, Associations",
  created_at: 2.days.ago
)

posts.each do |post|
  tag_list = post.tag_list
  post.tag_list = nil
  post.save!
  post.sync_tags!(tag_list)
end

# ——— COMMENTS ———

Comment.create!(
  post: posts[0],
  user: lucas,
  body: "Le souci vient des dépendances : fetchData modifie `data`, ce qui relance l'effet → boucle infinie. Essaie `[]` pour un appel unique au montage, ou useCallback pour stabiliser fetchData.",
  created_at: 1.hour.ago
)

Comment.create!(
  post: posts[0],
  user: thomas,
  body: "Pour compléter Lucas : si tu as besoin de relancer fetchData quand une vraie condition change, utilise un ID ou une valeur primitive comme dépendance, jamais un objet ou un tableau directement.",
  created_at: 45.minutes.ago
)

Comment.create!(
  post: posts[1],
  user: lucas,
  body: "Le problème vient sûrement de l'élément parent. Si son parent n'a pas de hauteur définie, `height: 100vh` sur .container ne suffira pas. Vérifie que html, body ont bien height: 100%.",
  created_at: 3.hours.ago
)

Comment.create!(
  post: posts[2],
  user: sofia,
  body: "Le JSON externe a probablement une structure différente de ce que tu attends. Fais un `print(data.keys())` avant d'accéder à 'user'. Utilise aussi `data.get('user', {})` pour éviter le KeyError.",
  created_at: 20.hours.ago
)

Comment.create!(
  post: posts[3],
  user: sofia,
  body: "Overfitting classique. Ajoute du Dropout (0.3-0.5) entre tes couches, du BatchNorm, et essaie L2 regularization (weight_decay dans ton optimizer). Augmente aussi ton dataset si possible.",
  created_at: 7.hours.ago
)

Comment.create!(
  post: posts[4],
  user: lucas,
  body: "Tu as oublié de faire `docker pull monuser/monapp:latest` sur le serveur avant le docker-compose up. L'image n'est pas automatiquement téléchargée si elle n'est pas en cache local.",
  created_at: 2.hours.ago
)

# ——— LIKES ———

Like.create!(user: lucas,   post: posts[0])
Like.create!(user: thomas,  post: posts[0])
Like.create!(user: sofia,   post: posts[1])
Like.create!(user: marie,   post: posts[2])
Like.create!(user: camille, post: posts[2])
Like.create!(user: hugo,    post: posts[3])
Like.create!(user: lucas,   post: posts[4])
Like.create!(user: thomas,  post: posts[4])
Like.create!(user: sofia,   post: posts[5])

# ——— BOOKMARKS ———

Bookmark.create!(user: hugo,    post: posts[0])
Bookmark.create!(user: marie,   post: posts[1])
Bookmark.create!(user: camille, post: posts[3])
Bookmark.create!(user: thomas,  post: posts[5])

# ——— RESOURCES ———

Resource.create!(
  user: lucas,
  subject: subjects["javascript"],
  title: "Comprendre les closures en JavaScript",
  body: <<~BODY,
    # Les closures en JavaScript

    Une closure est une fonction qui « se souvient » des variables de son environnement lexical, même après que cet environnement ait disparu.

    ## Exemple simple

    ```javascript
    function compteur() {
      let count = 0;
      return function() {
        count++;
        return count;
      };
    }

    const inc = compteur();
    inc(); // 1
    inc(); // 2
    inc(); // 3
    ```

    `count` reste accessible même après la fin de l'exécution de `compteur()`.

    ## Cas d'usage fréquents
    - Encapsulation (simuler des variables privées)
    - Mémorisation (memoization)
    - Callbacks avec contexte (event listeners, setTimeout)

    ## Piège classique : closures dans une boucle

    ```javascript
    for (var i = 0; i < 3; i++) {
      setTimeout(() => console.log(i), 100); // Affiche 3, 3, 3 !
    }
    // Solution : utiliser let à la place de var
    ```

    `let` crée une nouvelle variable à chaque itération, `var` partage la même.
  BODY
  status: :published,
  created_at: 3.days.ago
)

Resource.create!(
  user: lucas,
  subject: subjects["ruby-rails"],
  title: "Les fondamentaux de Git en 10 commandes",
  body: <<~BODY,
    # Les fondamentaux de Git

    Git est l'outil de gestion de version incontournable. Voici les 10 commandes que tout développeur doit maîtriser.

    ## Initialiser et cloner
    - `git init` — initialise un dépôt local
    - `git clone <url>` — clone un dépôt distant

    ## Travailler au quotidien
    - `git status` — état de l'arbre de travail
    - `git add .` — staging de tous les fichiers modifiés
    - `git commit -m "message"` — créer un commit

    ## Branches
    - `git checkout -b ma-branche` — créer et basculer sur une branche
    - `git merge ma-branche` — fusionner une branche dans la courante

    ## Synchronisation
    - `git pull` — récupérer et fusionner les changements distants
    - `git push` — pousser vos commits vers le dépôt distant

    ## Inspecter
    - `git log --oneline` — historique compact des commits

    ## Conseil pratique
    Commitez souvent, avec des messages clairs au présent impératif : "Ajoute le formulaire de connexion" plutôt que "Ajout form".
  BODY
  status: :published,
  created_at: 1.day.ago
)

Resource.create!(
  user: sofia,
  subject: subjects["python"],
  title: "Complexité algorithmique — O(n) expliqué simplement",
  body: <<~BODY,
    # La complexité algorithmique

    La notation O (grand O) mesure comment le temps d'exécution ou la mémoire évoluent quand la taille de l'entrée augmente.

    ## Les classes principales

    | Notation | Nom | Exemple |
    |---|---|---|
    | O(1) | Constante | Accès à un tableau par index |
    | O(log n) | Logarithmique | Recherche dichotomique |
    | O(n) | Linéaire | Parcourir un tableau |
    | O(n log n) | Linéarithmique | Tri fusion, tri rapide |
    | O(n²) | Quadratique | Tri à bulles, boucle imbriquée |
    | O(2ⁿ) | Exponentielle | Sous-ensembles d'un ensemble |

    ## Règles pratiques

    1. **Ignorer les constantes** : O(3n) = O(n)
    2. **Garder le terme dominant** : O(n² + n) = O(n²)
    3. **Boucles imbriquées** = multiplication : deux boucles en n → O(n²)

    ## Exemple concret

    ```python
    # O(n²) — à éviter sur de grandes données
    def contient_doublon(lst):
        for i in range(len(lst)):
            for j in range(i+1, len(lst)):
                if lst[i] == lst[j]:
                    return True
        return False

    # O(n) — bien mieux !
    def contient_doublon_v2(lst):
        return len(lst) != len(set(lst))
    ```
  BODY
  status: :published,
  created_at: 2.days.ago
)

Resource.create!(
  user: sofia,
  subject: subjects["intelligence-artificielle"],
  title: "Overfitting vs Underfitting — comprendre et corriger",
  body: <<~BODY,
    # Overfitting & Underfitting

    Ce sont les deux erreurs fondamentales en machine learning.

    ## Overfitting (sur-apprentissage)
    Le modèle mémorise les données d'entraînement au lieu d'apprendre les patterns généraux.
    - **Symptôme** : haute accuracy sur train, faible sur test
    - **Solutions** : Dropout, Regularisation L1/L2, plus de données, Data Augmentation, Early Stopping

    ## Underfitting (sous-apprentissage)
    Le modèle est trop simple pour capturer les patterns.
    - **Symptôme** : faible accuracy partout
    - **Solutions** : modèle plus complexe, plus d'epochs, meilleur feature engineering

    ## La règle d'or

    ```python
    # Toujours évaluer sur un set de validation séparé
    from sklearn.model_selection import train_test_split

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    ```

    ## Checklist avant de déployer
    - [ ] Gap train/test < 5% ?
    - [ ] Testé sur des données jamais vues ?
    - [ ] Validation croisée effectuée ?
  BODY
  status: :published,
  created_at: 5.hours.ago
)

# ——— EVENTS ———

Event.create!(
  title: "Hackathon 48h — IA & Développement Durable",
  description: "48 heures pour construire une solution tech au service de l'environnement avec l'IA. Équipes de 2 à 5 personnes. Prix : 5 000 € et mentorat startup. Tous niveaux acceptés.",
  event_type: "hackathon",
  starts_at: 3.weeks.from_now,
  ends_at: 3.weeks.from_now + 2.days,
  location: "Station F, Paris 13e",
  organizer: "GreenTech Challenge",
  online: false,
  external_url: "https://example.com/hackathon-ia-durabilite",
  subject: subjects["intelligence-artificielle"]
)

Event.create!(
  title: "Portes ouvertes — École 42 Paris",
  description: "Découvrez la pédagogie par projets de 42 : pas de cours magistraux, 100 % pratique. Rencontrez des étudiants et des alumnis, testez la piscine. Inscription en ligne obligatoire.",
  event_type: "open_house",
  starts_at: 2.weeks.from_now,
  ends_at: 2.weeks.from_now + 1.day,
  location: "École 42, Paris 17e",
  organizer: "École 42",
  online: false,
  external_url: "https://example.com/42-portes-ouvertes",
  subject: nil
)

Event.create!(
  title: "Conférence — DevOps & Cloud Native 2025",
  description: "Une journée de conférences autour de Kubernetes, CI/CD, GitOps et observabilité. Speakers issus de l'industrie. 400 participants attendus. Networking le soir.",
  event_type: "conference",
  starts_at: 5.weeks.from_now,
  ends_at: 5.weeks.from_now,
  location: "La Défense, Paris",
  organizer: "CloudCraft Community",
  online: false,
  external_url: "https://example.com/devops-cloud-native-2025",
  subject: subjects["devops-cloud"]
)

Event.create!(
  title: "Meetup — Ruby on Rails Paris #42",
  description: "La communauté Rails se retrouve pour des talks de 15 min sur Rails 8, Hotwire et les pratiques modernes. Bières et networking à l'issue.",
  event_type: "meetup",
  starts_at: 10.days.from_now,
  ends_at: 10.days.from_now,
  location: "Le Wagon Paris, Paris 9e",
  organizer: "Paris.rb",
  online: false,
  external_url: "https://example.com/paris-rb-meetup-42",
  subject: subjects["ruby-rails"]
)

Event.create!(
  title: "Webinaire — Introduction à la cybersécurité offensive",
  description: "Bases du pentesting : OWASP Top 10, outils Kali Linux, premiers CTF. Idéal pour les étudiants en BTS/Licence qui veulent se spécialiser en sécu.",
  event_type: "webinar",
  starts_at: 1.week.from_now,
  ends_at: 1.week.from_now,
  location: nil,
  organizer: "SecuriLearn",
  online: true,
  external_url: "https://example.com/webinaire-cybersec",
  subject: subjects["cybersecurite"]
)

Event.create!(
  title: "Hackathon Python — Data & Visualisation",
  description: "Résoudre des problèmes data réels avec Python, pandas et matplotlib. Pour tous niveaux. Encadrés par des data engineers senior. Prix : stage et matériel.",
  event_type: "hackathon",
  starts_at: 6.weeks.from_now,
  ends_at: 6.weeks.from_now + 1.day,
  location: "Campus Numérique, Lyon",
  organizer: "PyFrance",
  online: false,
  external_url: "https://example.com/hackathon-python-data",
  subject: subjects["python"]
)

Event.create!(
  title: "Forum des métiers — Numérique & IA",
  description: "Rencontrez des professionnels du numérique : développeurs, data scientists, UX designers, DevOps. Tables rondes, speed meetings et offres de stage. Gratuit sur inscription.",
  event_type: "conference",
  starts_at: 4.weeks.from_now,
  ends_at: 4.weeks.from_now,
  location: "Palais des Congrès, Paris",
  organizer: "Pôle Emploi Digital",
  online: false,
  external_url: "https://example.com/forum-numerique-ia",
  subject: nil
)

Event.create!(
  title: "Webinaire — Débuter avec React en 2025",
  description: "Tour d'horizon de React moderne : hooks, Context API, React Query, Server Components. Avec démo live et Q&A. Parfait pour les développeurs JS qui veulent passer au framework.",
  event_type: "webinar",
  starts_at: 3.days.from_now,
  ends_at: 3.days.from_now,
  location: nil,
  organizer: "JS Nation France",
  online: true,
  external_url: "https://example.com/webinaire-react-2025",
  subject: subjects["javascript"]
)

# ——— CONVERSATIONS ———

conv1 = Conversation.find_or_create_direct!(
  sender: hugo,
  recipient: lucas,
  topic: posts[0].title
)
conv1.mark_read_for!(hugo)
conv1.mark_read_for!(lucas)
[
  [hugo,  "Salut Lucas ! Mon useEffect part en boucle depuis ce matin, j'arrive pas à m'en sortir.", 2.hours.ago],
  [lucas, "Montre-moi ton code, on va regarder ça ensemble.", 110.minutes.ago],
  [hugo,  "useEffect(() => { fetchData(); }, [data]) — fetchData met à jour data à chaque fois.", 100.minutes.ago],
  [lucas, "Voilà le problème ! fetchData modifie data → l'effet se relance → boucle infinie. Utilise [] pour un appel unique au montage.", 90.minutes.ago],
  [hugo,  "Ah oui ! Et si j'ai besoin de relancer sur un vrai changement ?", 80.minutes.ago],
  [lucas, "Utilise une valeur primitive comme dépendance (un ID, un string), jamais un objet/tableau directement — ils changent de référence à chaque render.", 70.minutes.ago],
  [hugo,  "Super, ça marche maintenant ! Merci beaucoup.", 60.minutes.ago]
].each do |user, body, created_at|
  Message.create!(conversation: conv1, user: user, body: body, created_at: created_at, updated_at: created_at)
end

conv2 = Conversation.find_or_create_direct!(
  sender: camille,
  recipient: sofia,
  topic: posts[3].title
)
conv2.mark_read_for!(camille)
conv2.conversation_participants.find_by!(user: sofia).update!(last_read_at: 2.days.ago)
[
  [camille, "Hey Sofia, mon modèle overfitte grave — 97% train, 63% test. J'ai essayé de baisser les epochs mais rien.", 5.hours.ago],
  [sofia,   "Montre-moi ton architecture.", 4.hours.ago],
  [camille, "3 Linear layers : 784→512→256→10. Aucun dropout ni batch norm.", 3.hours.ago],
  [sofia,   "C'est là le problème. Ajoute nn.Dropout(0.4) entre chaque couche et nn.BatchNorm1d. Ça va régulariser ton modèle.", 2.hours.ago]
].each do |user, body, created_at|
  Message.create!(conversation: conv2, user: user, body: body, created_at: created_at, updated_at: created_at)
end

conv3 = Conversation.find_or_create_direct!(
  sender: marie,
  recipient: lucas,
  topic: "Méthode pour structurer un projet Rails"
)
conv3.mark_read_for!(marie)
conv3.mark_read_for!(lucas)
[
  [marie, "Lucas, tu as une bonne structure de départ pour un projet Rails avec auth et API ?", 3.days.ago],
  [lucas, "Oui ! Commence par rails new avec --api si c'est une API pure, sinon classique. Devise pour l'auth, active_model_serializers ou jbuilder pour le JSON.", 3.days.ago],
  [marie, "Et pour organiser les controllers tu fais comment ?", 3.days.ago],
  [lucas, "Namespace tout ce qui est admin dans Admin::, et tout ce qui est API dans Api::V1::. Ça garde le code propre quand ça grossit.", 3.days.ago]
].each do |user, body, created_at|
  Message.create!(conversation: conv3, user: user, body: body, created_at: created_at, updated_at: created_at)
end

# ——— SUBJECT REQUESTS ———

SubjectRequest.create!(
  user: hugo,
  name: "Rust",
  description: "De plus en plus utilisé en système, WebAssembly et embarqué. Beaucoup d'étudiants veulent apprendre mais il y a peu de ressources en français.",
  status: "pending",
  created_at: 2.days.ago
)

SubjectRequest.create!(
  user: thomas,
  name: "Architecture logicielle",
  description: "Clean Architecture, DDD, microservices, design patterns... Un sujet transversal que beaucoup de devs juniors cherchent à maîtriser sans savoir où commencer.",
  status: "pending",
  created_at: 4.days.ago
)

# ——— DONE ———

puts ""
puts "✓ Seed terminé !"
puts ""
puts "  Comptes disponibles :"
puts "  ┌─────────────────────────────────────┬──────────────────┬─────────────┐"
puts "  │ Email                               │ Mot de passe     │ Rôle        │"
puts "  ├─────────────────────────────────────┼──────────────────┼─────────────┤"
puts "  │ admin@allaboard.test                │ Admin1234!       │ Admin       │"
puts "  │ lucas@allaboard.test                │ Lucas1234!       │ Mentor      │"
puts "  │ sofia@allaboard.test                │ Sofia1234!       │ Mentor      │"
puts "  │ hugo@allaboard.test                 │ Hugo1234!        │ Étudiant    │"
puts "  │ camille@allaboard.test              │ Camille1234!     │ Étudiant    │"
puts "  │ thomas@allaboard.test               │ Thomas1234!      │ Étudiant    │"
puts "  │ marie@allaboard.test                │ Marie1234!       │ Étudiant    │"
puts "  └─────────────────────────────────────┴──────────────────┴─────────────┘"
puts ""
puts "  Données créées :"
puts "  - #{Subject.count} matières (dev & tech)"
puts "  - #{User.count} utilisateurs (1 admin, 2 mentors, 4 étudiants)"
puts "  - #{Post.count} posts, #{Comment.count} commentaires, #{Like.count} likes, #{Bookmark.count} bookmarks"
puts "  - #{Resource.count} ressources pédagogiques"
puts "  - #{Event.count} événements tech"
puts "  - #{Conversation.count} conversations, #{Message.count} messages"
puts "  - #{SubjectRequest.count} demandes de matières"
