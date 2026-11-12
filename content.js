// Parcours pédagogique adapté du chapitre CNN de Moussa Diallo (DIT).
// Les démonstrations complètent le support ; elles ne reproduisent pas son texte.
export const slides = [
  {
    id: 'voir-comprendre', section: '01 Les bases', kicker: 'CHAPITRE 03 · RÉSEAUX CONVOLUTIFS',
    title: 'Comment un ordinateur apprend-il à voir ?',
    intro: 'Une image, des petits motifs, puis une décision. Nous allons construire cette idée ensemble, une manipulation à la fois.',
    demo: 'hero', takeaway: 'Un CNN apprend des filtres qui repèrent des motifs utiles dans les images.',
    prompt: 'Quand vous reconnaissez un chat, quels détails regardez-vous en premier ?',
    notes: 'Commencer par les réponses des étudiants : oreilles, yeux, moustaches. Annoncer le contrat : observer, essayer, expliquer avec ses mots, puis seulement écrire une formule.',
    source: 'Diapositives 1, 4 et 5 du support', duration: 2
  },
  {
    id: 'un-neurone', section: '01 Les bases', kicker: 'REPARTIR D’UNE IDÉE SIMPLE',
    title: 'Un neurone fait une somme pondérée',
    intro: 'Chaque entrée apporte une information. Le poids règle son importance ; le biais décale le résultat. Une activation transforme ensuite cette somme.',
    demo: 'neuron', takeaway: 'Entrées × poids, puis somme + biais, puis activation : cette recette reste présente dans les CNN.',
    prompt: 'Si un poids devient négatif, quel effet son entrée a-t-elle sur la somme ?',
    notes: 'Faire modifier un seul poids, prédire le résultat, puis observer. Distinguer la somme z de la sortie après activation. Les poids affichés dans une manipulation sont choisis ; en apprentissage, ils sont ajustés à partir des exemples.',
    source: 'Passerelle avec le chapitre 1 : perceptron', duration: 4
  },
  {
    id: 'du-neurone-au-mlp', section: '01 Les bases', kicker: 'LE LIEN AVEC LE CHAPITRE 2',
    title: 'Un MLP combine plusieurs neurones',
    intro: 'Dans une couche dense, chaque neurone reçoit toutes les sorties de la couche précédente. Plusieurs couches permettent de combiner les informations.',
    demo: 'mlp', takeaway: 'Le CNN conserve les neurones et l’apprentissage ; il organise autrement les connexions pour traiter les images.',
    prompt: 'Dans une couche dense, un neurone regarde-t-il une petite zone ou toutes les entrées ?',
    notes: 'Suivre un seul chemin de gauche à droite avant de commenter le réseau entier. Rappeler que les activations entre les couches permettent au MLP de représenter des relations non linéaires.',
    source: 'Passerelle avec le chapitre 2 : MLP', duration: 3
  },
  {
    id: 'image-nombres', section: '01 Les bases', kicker: 'AVANT LE RÉSEAU',
    title: 'Pour la machine, une image est un tableau',
    intro: 'Une image en niveaux de gris contient une valeur par pixel. Des pixels voisins dessinent ensemble une ligne, un coin ou une forme.',
    demo: 'pixels', takeaway: 'La position des nombres et leurs voisinages portent une partie essentielle de l’information visuelle.',
    prompt: 'Si l’on mélange les positions des pixels, la liste des valeurs suffit-elle à reconnaître le dessin ?',
    notes: 'Faire dessiner une forme simple dans la grille. Relier un pixel allumé à sa valeur. Ne pas généraliser la convention clair/sombre : elle dépend du codage choisi, indiqué dans la démonstration.',
    source: 'Préparation aux diapositives 2 à 6 du support', duration: 4
  },
  {
    id: 'limites-dense', section: '01 Les bases', kicker: 'POURQUOI CHANGER D’OUTIL ?',
    title: 'Tout relier devient vite coûteux',
    intro: 'Aplatir une grande image donne une très longue liste. La relier à une couche dense demande beaucoup de poids et ne privilégie pas les pixels voisins.',
    demo: 'params', takeaway: 'Les CNN exploitent les voisinages et réutilisent les mêmes poids à plusieurs positions.',
    prompt: 'Si la largeur et la hauteur doublent, combien de fois plus de pixels obtenons-nous ?',
    notes: 'Faire compter les connexions sur une petite image avant de montrer une grande résolution. Le surapprentissage n’est pas automatique : il dépend aussi des données, de la capacité du modèle et de la régularisation.',
    source: 'Diapositives 2 et 3 du support', duration: 3
  },
  {
    id: 'regarder-localement', section: '02 La convolution', kicker: 'L’INTUITION DU CNN',
    title: 'Observer une petite zone, puis se déplacer',
    intro: 'Une petite fenêtre inspecte une région de l’image. Le même détecteur parcourt ensuite les autres régions pour chercher le même type de motif.',
    demo: 'local', takeaway: 'Connexions locales et partage des poids sont les deux idées centrales de la convolution.',
    prompt: 'Pour trouver une ligne à droite, faut-il apprendre un nouveau détecteur si on sait déjà la trouver à gauche ?',
    notes: 'Mimer une loupe que l’on déplace. Une convolution est équivariante aux translations dans des conditions adaptées : le motif déplacé déplace sa réponse. Cela ne garantit pas une classification invariante à toute translation.',
    source: 'Diapositives 5 et 6 du support', duration: 3
  },
  {
    id: 'un-filtre', section: '02 La convolution', kicker: 'OBSERVER AVANT DE CALCULER',
    title: 'Un filtre réagit à certains motifs',
    intro: 'Un filtre est un petit tableau de poids. Selon ces poids, sa réponse peut souligner une séparation entre zones claires et sombres, par exemple un bord.',
    demo: 'filters', takeaway: 'La carte obtenue indique où le filtre répond et avec quelle intensité.',
    prompt: 'Quel filtre répond le plus fortement au motif que vous venez de dessiner ?',
    notes: 'Comparer deux filtres sur la même entrée. Préciser que les filtres de bord proposés sont des exemples construits pour comprendre ; dans un CNN entraîné, les valeurs des filtres sont apprises.',
    source: 'Diapositives 6 et 9 du support', duration: 4
  },
  {
    id: 'calcul-convolution', section: '02 La convolution', kicker: 'LA RECETTE, CASE PAR CASE',
    title: 'Multiplier, additionner, avancer',
    intro: 'À une position donnée, on multiplie chaque pixel par le poids placé en face. On additionne les produits, puis le biais éventuel : on obtient une case de la carte de sortie.',
    demo: 'convolution', takeaway: 'Une case de sortie résume le calcul d’un filtre sur une zone précise de l’entrée.',
    prompt: 'Quels pixels ont participé au calcul de la case de sortie sélectionnée ?',
    notes: 'Faire une position à la main avant de lancer le déplacement. Dans les bibliothèques de deep learning, l’opération appelée convolution utilise habituellement le noyau sans le retourner : techniquement, une corrélation croisée.',
    source: 'Diapositives 6 à 8 du support', duration: 6
  },
  {
    id: 'calculer-soi-meme', section: '02 La convolution', kicker: 'PAUSE · À VOUS DE PRÉDIRE',
    title: 'Une seule case, un calcul complet',
    intro: 'Prenez un instant pour multiplier les nombres en face à face. Faites ensuite la somme, avec un biais égal à zéro.',
    demo: 'dotquiz', takeaway: 'Un poids nul ignore une valeur ; un poids négatif soustrait sa contribution.',
    question: {
      text: 'Patch : [1, 2 ; 3, 4]. Filtre : [1, 0 ; 0, −1]. Biais : 0. Quelle est la sortie ?',
      options: ['−3', '3', '5', '10'], answer: 0,
      explanation: '1 × 1 + 2 × 0 + 3 × 0 + 4 × (−1) = 1 − 4 = −3. Une convolution peut produire des valeurs négatives.'
    },
    prompt: 'Quelle multiplication explique le signe négatif de la réponse ?',
    notes: 'Laisser trente secondes de réflexion individuelle avant le vote. Si beaucoup choisissent 3, reprendre le signe de 4 × (−1). Ne pas appliquer ReLU à cette étape : on calcule d’abord la sortie de convolution.',
    source: 'Mise en pratique des diapositives 7 et 8', duration: 3
  },
  {
    id: 'plusieurs-filtres', section: '02 La convolution', kicker: 'UNE IMAGE, PLUSIEURS REGARDS',
    title: 'Chaque filtre produit sa propre carte',
    intro: 'Un filtre peut répondre à un type de bord, un autre à un motif différent. Les cartes s’empilent : leur nombre correspond au nombre de filtres.',
    demo: 'filterbank', takeaway: 'Avec K filtres, la sortie possède K canaux, quelle que soit la profondeur de l’entrée.',
    prompt: 'Si une couche applique 12 filtres à une image couleur, combien de cartes produit-elle ?',
    notes: 'Réponse attendue : 12, pas 36. Un filtre d’une convolution standard couvre tous les canaux de l’entrée et additionne leurs contributions pour produire une seule carte.',
    source: 'Diapositive 9 du support', duration: 3
  },
  {
    id: 'stride', section: '02 La convolution', kicker: 'RÉGLER LE DÉPLACEMENT',
    title: 'Le stride est la longueur du pas',
    intro: 'Avec un stride de 1, le filtre avance d’une case. Avec un stride de 2, ses positions de départ sont espacées de deux cases : il calcule moins de sorties.',
    demo: 'stride', takeaway: 'Augmenter le stride réduit généralement la largeur et la hauteur de la sortie.',
    prompt: 'Avant de changer le stride, prévoyez : la carte sera-t-elle plus grande ou plus petite ?',
    notes: 'Comparer les positions de départ avec la même image et le même filtre. Le filtre ne change pas de taille. Un stride de 2 n’implique pas toujours une sortie exactement deux fois plus petite : les dimensions et le padding interviennent.',
    source: 'Diapositive 10 du support', duration: 3
  },
  {
    id: 'padding', section: '02 La convolution', kicker: 'QUE FAIRE AUX BORDS ?',
    title: 'Le padding ajoute une bordure',
    intro: 'Sans bordure, le filtre doit rester entièrement dans l’image. Ajouter des zéros autour permet d’inclure plus de positions, notamment près des bords.',
    demo: 'padding', takeaway: 'Un filtre 3 × 3, un stride de 1 et un padding de 1 conservent la taille spatiale.',
    prompt: 'Une bordure de zéros ajoute-t-elle de nouvelles informations provenant de la scène photographiée ?',
    notes: 'Montrer que les zéros sont ajoutés par nous. Pour un noyau impair F et un stride de 1, P = (F − 1) / 2 conserve la taille. Ne pas appliquer cette règle sans ses conditions.',
    source: 'Diapositive 11 du support', duration: 3
  },
  {
    id: 'dimensions', section: '02 La convolution', kicker: 'LA FORMULE VIENT APRÈS L’INTUITION',
    title: 'Compter les positions possibles du filtre',
    intro: 'La taille de sortie dépend de la taille d’entrée N, du filtre F, du padding P et du stride S. La même règle s’applique séparément à la hauteur et à la largeur.',
    demo: 'shapes', takeaway: 'Taille de sortie = ⌊(N − F + 2P) / S⌋ + 1. Le nombre de filtres fixe le nombre de canaux de sortie.',
    prompt: 'Avec N = 5, F = 3, P = 0 et S = 1, combien de positions existe-t-il sur une ligne ?',
    notes: 'Faire placer le filtre mentalement aux positions 0, 1 et 2 : trois positions. Les crochets de partie entière signifient arrondir vers le bas. Cette formule suppose une convolution standard sans dilatation.',
    source: 'Diapositives 9 à 11 du support', duration: 5
  },
  {
    id: 'couleur-canaux', section: '02 La convolution', kicker: 'PASSER DU GRIS À LA COULEUR',
    title: 'Une image RGB a trois canaux',
    intro: 'Rouge, vert et bleu sont trois tableaux superposés. Un filtre standard possède une tranche de poids par canal ; leurs contributions sont additionnées.',
    demo: 'rgb', takeaway: 'Un filtre 3 × 3 appliqué à une entrée RGB contient 3 × 3 × 3 poids, plus un biais éventuel.',
    prompt: 'Un seul filtre sur trois canaux d’entrée produit-il une ou trois cartes de sortie ?',
    notes: 'Réponse : une carte. Pour 12 filtres, chacun possède ses 27 poids et produit sa carte. Introduire la profondeur comme nombre de canaux, sans la confondre avec le nombre de couches du réseau.',
    source: 'Diapositive 9 du support', duration: 3
  },
  {
    id: 'relu', section: '03 Construire un CNN', kicker: 'TRANSFORMER LES RÉPONSES',
    title: 'ReLU remplace le négatif par zéro',
    intro: 'Après la convolution, une activation est appliquée à chaque valeur. ReLU garde les valeurs positives et remplace les valeurs négatives par zéro.',
    demo: 'relu', takeaway: 'ReLU(x) = max(0, x). Elle change les valeurs, sans changer la forme du tableau.',
    prompt: 'Après ReLU, que deviennent −4, 0 et 3 ?',
    notes: 'Faire prédire chaque résultat avant de révéler la carte transformée. Une valeur négative n’est pas une erreur de calcul ; ReLU est une transformation choisie. Elle introduit une non-linéarité.',
    source: 'Diapositives 6, 13 et 14 du support', duration: 3
  },
  {
    id: 'max-pooling', section: '03 Construire un CNN', kicker: 'RÉSUMER UNE PETITE RÉGION',
    title: 'Max pooling : garder la plus grande valeur',
    intro: 'On parcourt une carte avec une fenêtre, souvent 2 × 2 avec un stride de 2. Dans chaque fenêtre, on ne conserve que le maximum.',
    demo: 'pooling', takeaway: 'Le pooling réduit les dimensions spatiales et traite chaque canal séparément.',
    prompt: 'Dans le bloc [1, 5 ; 2, 3], quelle valeur restera après max pooling ?',
    notes: 'Faire repérer le maximum avant de montrer la sortie. Le pooling ne contient pas de poids appris. Il peut réduire la sensibilité à de petits déplacements, sans garantir une invariance à tout déplacement.',
    source: 'Diapositives 12 et 13 du support', duration: 4
  },
  {
    id: 'average-pooling', section: '03 Construire un CNN', kicker: 'DEUX FAÇONS DE RÉSUMER',
    title: 'Maximum ou moyenne : le résultat change',
    intro: 'Le max pooling garde la réponse la plus forte. L’average pooling calcule la moyenne de toutes les valeurs de la fenêtre.',
    demo: 'average', takeaway: 'Le maximum souligne une forte réponse locale ; la moyenne résume le niveau global de la région.',
    prompt: 'Pour [1, 5 ; 2, 4], quelles sorties donnent le maximum et la moyenne ?',
    notes: 'Résultats attendus : maximum 5, moyenne 3. Les deux opérations perdent de l’information. Ne pas présenter le pooling comme une garantie contre le surapprentissage ; la réduction du volume peut aider selon l’architecture.',
    source: 'Diapositive 12 du support', duration: 3
  },
  {
    id: 'chaine-cnn', section: '03 Construire un CNN', kicker: 'ASSEMBLER LES BRIQUES',
    title: 'Du pixel à une représentation utile',
    intro: 'La convolution cherche des motifs, ReLU transforme les réponses et le pooling résume les régions. En répétant ces étapes, les couches combinent des motifs de plus en plus complexes.',
    demo: 'architecture', takeaway: 'Chaque couche transforme un volume : sa hauteur, sa largeur et son nombre de canaux peuvent évoluer.',
    prompt: 'Quelle étape apprend des poids ? Quelle étape réduit la taille ? Laquelle remet le négatif à zéro ?',
    notes: 'Parcourir la chaîne une brique à la fois. Éviter de promettre qu’un filtre correspond toujours à un objet compréhensible : les représentations apprises ne sont pas toutes faciles à nommer. Toutes les architectures ne possèdent pas obligatoirement ces mêmes blocs.',
    source: 'Diapositives 14 et 16 du support', duration: 4
  },
  {
    id: 'flatten', section: '03 Construire un CNN', kicker: 'CHANGER LA FORME',
    title: 'Flatten déroule les valeurs en une liste',
    intro: 'Avant une couche dense, on peut réorganiser un volume en un vecteur. Les valeurs sont conservées : seule leur organisation change.',
    demo: 'flatten', takeaway: 'Un volume H × W × C devient une liste de H × W × C valeurs. Flatten n’apprend aucun poids.',
    prompt: 'Un volume 2 × 2 × 3 donnera-t-il 4, 7 ou 12 valeurs après flatten ?',
    notes: 'Réponse : 12. Corriger explicitement l’idée du support selon laquelle flatten réduirait l’espace et augmenterait la profondeur : il réorganise les éléments sans en réduire le nombre. Un pooling global est une autre option, qui n’est pas un flatten.',
    source: 'Diapositives 14, 15 et 18 du support · précision sur flatten', duration: 3
  },
  {
    id: 'classification', section: '03 Construire un CNN', kicker: 'PRENDRE UNE DÉCISION',
    title: 'Les caractéristiques servent à classer',
    intro: 'Les couches finales combinent les caractéristiques pour produire un score par classe. Softmax transforme ces scores en nombres positifs dont la somme vaut 1.',
    demo: 'classifier', takeaway: 'La classe au score le plus élevé est la prédiction ; la valeur affichée ne garantit pas que la réponse est juste.',
    prompt: 'Un modèle qui affiche une forte probabilité peut-il tout de même se tromper ?',
    notes: 'Oui : les sorties softmax ne sont pas automatiquement des probabilités bien calibrées. La démonstration illustre le passage des scores aux sorties ; elle ne doit pas être présentée comme un modèle préentraîné reconnaissant de vraies photos.',
    source: 'Diapositive 15 du support', duration: 3
  },
  {
    id: 'apprendre-filtres', section: '03 Construire un CNN', kicker: 'D’OÙ VIENNENT LES POIDS ?',
    title: 'Apprendre, c’est ajuster les poids',
    intro: 'Le réseau prédit, compare sa réponse à l’étiquette correcte, puis ajuste ses poids pour diminuer l’erreur. La rétropropagation calcule comment chaque poids contribue à cette erreur.',
    demo: 'learning', takeaway: 'Les filtres d’un CNN sont appris à partir d’exemples ; ils ne sont pas tous dessinés à la main.',
    prompt: 'Que doit-on garder à part pour vérifier si le réseau réussit sur de nouvelles images ?',
    notes: 'Réponse : des données de validation ou de test, distinctes des données d’entraînement. Relier la boucle prédiction → perte → gradients → mise à jour au MLP déjà étudié. Un faible coût d’entraînement ne suffit pas à prouver la généralisation.',
    source: 'Lien avec l’apprentissage des chapitres 1 et 2 ; filtres apprenables de la diapositive 9', duration: 4
  },
  {
    id: 'lenet', section: '03 Construire un CNN', kicker: 'UN EXEMPLE HISTORIQUE',
    title: 'LeNet-5 relie ces idées',
    intro: 'LeNet-5 a été conçu pour reconnaître des caractères, notamment des chiffres manuscrits. Son architecture alterne convolutions et sous-échantillonnage avant la décision finale.',
    demo: 'lenet', takeaway: 'Lire une architecture consiste à suivre les transformations des dimensions et le rôle de chaque couche.',
    prompt: 'Pourquoi les cartes deviennent-elles plus petites alors que leur nombre peut augmenter ?',
    notes: 'Présenter les dimensions classiques : entrée 32 × 32 × 1, C1 28 × 28 × 6, S2 14 × 14 × 6, C3 10 × 10 × 16, S4 5 × 5 × 16, C5 1 × 1 × 120, F6 84, sortie 10 classes. LeNet-5 original utilise des activations de type tanh et un sous-échantillonnage avec paramètres ; ne pas lui attribuer ReLU et max pooling comme description historique exacte. Les connexions C3 et la sortie historiques comportent aussi des particularités omises dans un schéma simplifié.',
    source: 'Diapositive 17 du support', duration: 4
  },
  {
    id: 'exercice-support', section: '04 À vous de jouer', kicker: 'L’EXERCICE DE VOTRE SUPPORT',
    title: 'Suivre une image de 256 × 256 × 3',
    intro: 'Calculez la forme après chaque couche. Gardez séparées les deux questions : quelle est la taille spatiale et combien de canaux restent-ils ?',
    demo: 'exercise', takeaway: 'Une convolution fixe les canaux par son nombre de filtres ; le pooling conserve ce nombre de canaux.',
    prompt: 'Après le deuxième pooling, peut-on retrouver 3 canaux simplement parce que l’image de départ était RGB ?',
    notes: 'Non. Correction : conv 16 filtres 3 × 3, S1, P1 → 256 × 256 × 16 ; pool 2 × 2, S2 → 128 × 128 × 16 ; conv 8 filtres 7 × 7, S1, P3 → 128 × 128 × 8 ; pool 2 × 2, S2 → 64 × 64 × 8. Faire justifier chaque dimension avant de révéler l’étape suivante.',
    source: 'Diapositive 19 du support', duration: 7
  },
  {
    id: 'quiz', section: '04 À vous de jouer', kicker: 'VÉRIFIER SA COMPRÉHENSION',
    title: 'Expliquer vaut mieux que mémoriser',
    intro: 'Répondez sans regarder les diapositives précédentes. Après chaque réponse, lisez l’explication et reformulez la règle avec vos propres mots.',
    demo: 'quiz', takeaway: 'Une erreur permet de repérer l’idée à retravailler : calcul, dimensions ou rôle des couches.',
    prompt: 'Quelle réponse avez-vous choisie, et surtout : pourquoi ?',
    notes: 'Utiliser les réponses comme diagnostic, sans noter la vitesse. Revenir au simulateur associé quand une confusion persiste. Faire expliquer une réponse correcte par un étudiant avant de montrer le corrigé.',
    source: 'Synthèse des diapositives 6 à 18 du support', duration: 6
  },
  {
    id: 'essentiel', section: '04 À vous de jouer', kicker: 'LA CARTE À GARDER EN TÊTE',
    title: 'Six briques, six rôles distincts',
    intro: 'Convolution, activation, pooling, flatten, couche dense et apprentissage n’ont pas le même rôle. Les distinguer permet de lire un CNN sans se perdre dans le vocabulaire.',
    demo: 'recap', takeaway: 'Convolution : extraire. ReLU : transformer. Pooling : résumer. Flatten : réorganiser. Dense : combiner. Apprentissage : ajuster.',
    prompt: 'Quelle brique choisiriez-vous pour diminuer la hauteur et la largeur sans apprendre de poids ?',
    notes: 'Réponse attendue : un pooling. Demander ensuite quelle brique ne fait que réorganiser les valeurs : flatten. Les CNN exploitent bien la structure des images, mais leur supériorité sur un MLP dépend de la tâche et des conditions.',
    source: 'Diapositive 18 du support · synthèse corrigée et enrichie', duration: 3
  },
  {
    id: 'defi-binome', section: '04 À vous de jouer', kicker: 'TRANSFÉRER À UN NOUVEAU CAS',
    title: 'À deux : concevoir et justifier un petit CNN',
    intro: 'Partez d’un chiffre en niveaux de gris de 28 × 28 × 1. Suivez une convolution de 8 filtres 3 × 3, stride 1, padding 1, puis ReLU, max pooling 2 × 2 et flatten.',
    demo: 'challenge', takeaway: 'Pouvoir prédire les formes et expliquer les choix montre que l’on comprend la chaîne.',
    prompt: 'Combien de valeurs entrent dans la couche dense après flatten ? Expliquez chaque étape.',
    notes: 'Faire travailler en binômes : une personne calcule, l’autre vérifie et explique. Correction : convolution 28 × 28 × 8 ; ReLU même forme ; pooling stride 2 → 14 × 14 × 8 ; flatten → 1 568 valeurs. Bonus : convolution = (3 × 3 × 1 + 1) × 8 = 80 paramètres avec biais. La couche dense finale produit 10 scores.',
    source: 'Activité de transfert inspirée de l’exercice final du support', duration: 6
  },
  {
    id: 'fin', section: '04 À vous de jouer', kicker: 'DU COURS À LA PRATIQUE',
    title: 'Vous pouvez maintenant lire un CNN',
    intro: 'Vous avez relié les neurones aux images, calculé une convolution et suivi les dimensions d’un réseau. L’étape suivante : entraîner un petit modèle et examiner aussi ses erreurs.',
    demo: 'finish', takeaway: 'Pour chaque couche : quelle information entre, quelle opération est faite, et quelle forme sort ?',
    prompt: 'Quelle idée vous paraît encore floue ? Montrez-la avec un exemple précis.',
    notes: 'Terminer par un billet de sortie : chaque étudiant écrit une chose comprise et une question restante. Pour le TP, commencer par visualiser les images, séparer entraînement et test, puis comparer les prédictions correctes et incorrectes.',
    source: 'Conclusion pédagogique et préparation au TP', duration: 2
  }
];
