# CNN Explorer — le chapitre CNN en cours interactif

Ce site accompagne le cours de deep learning de Moussa Diallo pour les étudiants de première année IA du DIT. Il reprend les notions du PowerPoint « CHAPITRE 3_CNN [Autosaved].pptx » et les réorganise en 27 étapes avec illustrations, manipulations et questions. Le PowerPoint original reste inchangé.

Le parcours part d’un rappel du neurone et du MLP, puis suit une image à travers une convolution, ReLU, le pooling et la classification. Les formules arrivent après les observations et les essais. Les filtres construits pour les démonstrations sont distingués des poids appris ; les exemples simplifiés sont signalés.

## Utiliser le cours

- Avancer ou reculer avec les boutons en bas de page ou les flèches du clavier. Le sommaire permet de rejoindre directement une étape.
- Activer le mode présentation avec le bouton prévu ou la touche **F** pour la projection en classe.
- Ouvrir les notes enseignant pour voir une question orale, une proposition d’animation et les confusions à reprendre.
- Faire prédire le résultat avant de manipuler un réglage, puis demander une explication avec les mots de l’étudiant.
- Utiliser les quiz et l’exercice comme diagnostic : une erreur invite à revenir à la démonstration correspondante.
- Ouvrir la fiche mémo depuis le cours pour l’imprimer ou l’enregistrer en PDF ; elle est prévue sur deux pages A4.

La progression et les réponses aux quiz sont enregistrées uniquement dans le navigateur utilisé. Elles ne sont pas envoyées à l’enseignant et ne constituent pas un suivi de classe. Pour effacer cette progression locale, utiliser l’action de reprise à zéro proposée à la fin du parcours.

Pour une utilisation sans connexion, ouvrir le fichier autonome [CNN-Explorer-hors-ligne.html](cours-hors-ligne.zip). La [fiche mémo](fiche-memo.html) s’ouvre directement dans un navigateur.

## Organiser les séances

Le minutage indicatif des 27 étapes représente environ **101 minutes**, sans compter les pauses et les discussions supplémentaires. Il peut être adapté selon les réponses des étudiants.

Une répartition simple en deux séances :

1. **Étapes 1 à 14 — 49 minutes environ :** réactiver les bases, dessiner des pixels, comprendre les filtres et calculer une convolution, un stride, un padding et une forme de sortie.
2. **Étapes 15 à 27 — 52 minutes environ :** distinguer les opérations, assembler le réseau, suivre l’apprentissage, résoudre l’exercice et terminer par un défi en binôme.

Pour chaque manipulation, garder le même rythme : **observer → prédire → essayer → expliquer → écrire la règle**. Un écran dense peut être repris lentement ; il n’est pas nécessaire de tout présenter en une seule fois.

## Correspondance avec le PowerPoint

Une même notion peut revenir à plusieurs étapes : les rappels, essais et synthèses sont volontaires. Les numéros ci-dessous sont ceux du PowerPoint fourni et des 27 écrans du site.

| Diapositives du PowerPoint | Étapes du site | Adaptation pédagogique |
| --- | --- | --- |
| 1, 4 et 5 — titre et introduction | 1, 6 | Poser une question concrète, puis introduire la recherche locale de motifs. |
| 2 et 3 — limites des couches denses | 4, 5 | Représenter une image par ses pixels et compter les paramètres. |
| 6 à 8 — convolution et produit scalaire | 7, 8, 9, 15 | Comparer les filtres, dérouler un calcul case par case, faire prédire une réponse, puis appliquer ReLU. |
| 9 — filtres, cartes et dimensions | 7, 10, 13, 14, 21 | Distinguer cartes et canaux, calculer une forme, comprendre RGB et relier les poids à l’apprentissage. |
| 10 et 11 — stride et padding | 11, 12, 13 | Manipuler le déplacement et la bordure avant d’écrire la formule. |
| 12 et 13 — pooling et activation | 15, 16, 17 | Transformer les valeurs puis comparer maximum et moyenne sur de petits tableaux. |
| 14 à 16 — architecture, couches denses, sortie | 18, 19, 20 | Suivre les volumes, réorganiser avec flatten et comprendre les scores de classification. |
| 17 — LeNet-5 | 22 | Lire les dimensions du modèle historique et signaler ses différences avec les exemples modernes. |
| 18 — conclusion | 19, 25 | Corriger la description de flatten et associer chaque brique à son rôle. |
| 19 — exercice | 23, 26 | Résoudre les quatre formes du support, puis transférer à un nouveau cas en binôme. |
| Passerelles et ajouts | 2, 3, 24, 27 | Revoir le perceptron et le MLP, vérifier la compréhension et préparer le TP. |

## Précisions apportées au support

- **Flatten** conserve le nombre de valeurs et change leur organisation. Il ne réduit pas le volume de données.
- La formule de dimension inclut la **partie entière** ; la règle de padding conservant la taille suppose un filtre impair et un stride de 1.
- Une convolution standard produit **une carte par filtre**, en combinant les canaux d’entrée.
- Le max pooling et l’average pooling standards n’apprennent aucun poids. Leur robustesse aux petits déplacements ne garantit pas une invariance à toute translation.
- LeNet-5 historique est distingué d’une adaptation moderne utilisant ReLU, max pooling et softmax.
- L’expérience d’apprentissage porte sur des exemples artificiels réduits. Elle ne mesure pas les performances d’un CNN complet sur des photographies.

Références de vérification : [documentation officielle PyTorch Conv2d](https://docs.pytorch.org/docs/2.15/generated/torch.nn.modules.conv.Conv2d.html) ; [article original de LeNet-5, hébergé par Léon Bottou](https://leon.bottou.org/publications/pdf/ieee-1998.pdf).

## Publication GitHub Pages

Le site utilise uniquement HTML, CSS et JavaScript dans le navigateur. Il ne demande ni installation, ni clé, ni serveur.

Les fichiers sont publiés depuis la branche `main`, dossier `/ (root)`. Le fichier `.nojekyll` désactive le traitement Jekyll. Dans le dépôt GitHub : Settings → Pages → Deploy from a branch → main → / (root). Les mises à jour de `main` sont ensuite publiées automatiquement.

Adresse prévue : https://bigmoussa.github.io/cnn-explorer-dit/
