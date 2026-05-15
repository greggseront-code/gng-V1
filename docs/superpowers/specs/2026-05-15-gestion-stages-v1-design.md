# Gestion Des Stages V1 Design

## Objectif

Construire une application web unique de gestion des stages pour trois publics
distincts: equipe pedagogique, etudiants et entreprises. Cette V1 couvre le
depot d'offres, leur validation pedagogique, leur publication aux etudiants et
le depot de candidatures, sans traiter encore le workflow complet apres
candidature.

## Perimetre V1

La V1 couvre:

- l'import initial des etudiants par CSV
- la gestion d'un referentiel d'entreprises et de contacts entreprise
- le depot d'offres par les entreprises
- le depot de propositions de stage par les etudiants
- la validation des offres et propositions par l'equipe pedagogique
- la publication des offres validees aux etudiants
- la consultation du referentiel d'entreprises par les etudiants, meme sans
  offre publiee
- la postulation des etudiants sur les offres publiees
- la validation par l'entreprise d'un etudiant ayant postule
- le marquage final d'une offre comme prise ou non disponible

La V1 ne couvre pas:

- le SSO Microsoft
- la gestion avancee des candidatures apres depot
- les conventions et signatures
- les documents administratifs aval
- les workflows d'evaluation pedagogique

## Approche Produit

L'application prend la forme d'un portail unique multi-roles. Chaque utilisateur
se connecte a la meme application, puis accede a un espace adapte a son role.
Ce choix evite de dupliquer les interfaces et permet de partager un meme modele
de donnees et une meme logique de validation.

Les roles V1 sont:

- `gestionnaire`
- `lecteur`
- `etudiant`
- `entreprise`

## Architecture Fonctionnelle

### Espace pedagogique

L'espace pedagogique dispose de deux niveaux de droits:

- `gestionnaire`: peut importer les etudiants, consulter toutes les donnees,
  creer et corriger entreprises et contacts, valider ou refuser une offre,
  publier indirectement une offre en la validant, et cloturer une offre comme
  prise ou non disponible
- `lecteur`: peut consulter toutes les donnees sans modifier

L'espace pedagogique doit permettre:

- la vue des offres a traiter
- la consultation globale des entreprises, contacts, offres et candidatures
- la correction des donnees de reference
- la supervision de la publication des offres

### Espace etudiant

L'etudiant peut:

- consulter les offres validees et visibles
- consulter les entreprises, y compris celles sans offre publiee
- filtrer et rechercher les offres publiees
- postuler a une offre publiee par une entreprise
- deposer sa propre proposition de stage

La proposition etudiante part d'un formulaire leger. Si l'entreprise existe deja,
l'etudiant doit la retrouver et la reutiliser. Sinon, il peut suggerer sa
creation.

### Espace entreprise

L'entreprise dispose d'un mini-espace avec:

- son profil entreprise
- sa liste de contacts
- sa liste d'offres
- le statut de chaque offre
- les etudiants ayant postule a ses offres
- la creation et la modification d'offres

La V1 doit permettre a une meme entreprise de gerer plusieurs offres.

## Objets Metier

### Etudiant

Un etudiant est importe par CSV dans la V1. Il possede les informations minimales
necessaires a l'usage de l'application et a la candidature. Le detail exact des
colonnes CSV sera defini au plan d'implementation, mais l'import doit etre
pense comme le mode principal d'initialisation du referentiel.

### Entreprise

Une entreprise contient au minimum:

- nom
- adresse
- email general

Une entreprise peut etre:

- deja presente dans le referentiel
- creee par l'equipe pedagogique
- suggeree par un etudiant lors du depot d'une proposition
- creee ou completee par l'entreprise elle-meme dans son espace

### Contact entreprise

Un contact entreprise est rattache a une entreprise. Il contient:

- nom
- prenom
- email
- telephone optionnel
- roles

Les roles possibles sont:

- maitre de stage
- responsable administratif
- encadrant technique

Un contact peut porter un ou plusieurs roles.

Chaque entreprise doit disposer d'au moins un contact cree, en plus de son
email general, afin de rester exploitable meme si un contact quitte
l'entreprise.

### Offre de stage

Une offre contient:

- entreprise rattachee
- contacts rattaches
- description
- description du lieu de stage
- technologies utilisees
- objectifs du projet
- teletravail oui/non
- pourcentage de teletravail
- remarques optionnelles
- piece jointe optionnelle

Chaque offre doit etre rattachee a au moins un contact de l'entreprise
concernee. Parmi ces contacts, l'un doit etre identifie comme contact
prioritaire pour la candidature a l'offre.

L'offre est l'objet central de la V1, quel que soit son mode d'entree.

### Candidature

Une candidature relie un etudiant a une offre d'entreprise visible. En V1, son
role est d'enregistrer qu'un etudiant a postule. L'entreprise peut ensuite
retenir l'un des etudiants ayant postule. Le traitement detaille aval de la
candidature reste hors perimetre.

## Modes D'Entree Des Offres

### Offre creee par une entreprise

Le parcours est:

1. l'entreprise se connecte a son mini-espace
2. elle cree une offre
3. elle la soumet
4. l'equipe pedagogique la relit et la valide ou non
5. si elle est validee, elle devient visible aux etudiants
6. l'entreprise peut ensuite retenir un etudiant ayant postule, ce qui fait
   passer l'offre a l'etat `prise`

### Proposition deposee par un etudiant

Le parcours est:

1. l'etudiant remplit un formulaire leger
2. il rattache sa proposition a une entreprise existante si possible
3. si l'entreprise n'existe pas, il suggere sa creation
4. l'equipe pedagogique relit et complete si necessaire
5. l'equipe pedagogique valide ou non
6. si la proposition est validee, elle est consideree administrativement comme
   acceptable

La V1 ne demande pas a l'etudiant de gerer un workflow complet avec l'entreprise
apres cette validation.

## Statuts

Les statuts minimaux des offres en V1 sont:

- `soumise`
- `validee_et_visible`
- `prise`
- `non_disponible`

Interpretation:

- `soumise`: l'offre a ete deposee et attend validation pedagogique
- `validee_et_visible`: l'offre est approuvee et visible aux etudiants
- `prise`: l'offre a finalement ete attribuee a un etudiant et ne doit plus
  servir de support a de nouvelles attributions
- `non_disponible`: l'offre n'est plus ouverte, par exemple parce qu'elle a ete
  attribuee a un stagiaire d'une autre ecole

Pour rester simple, la V1 ne distingue pas un workflow de statuts different
selon que l'offre vient d'une entreprise ou d'un etudiant.

## Regles Metier

### Droits

- seuls les `gestionnaires` peuvent modifier les statuts
- seuls les `gestionnaires` peuvent corriger les entreprises et contacts
- les `lecteurs` ont un acces en lecture seule
- les `etudiants` ne voient que les offres validees et visibles, plus leurs
  propres interactions, ainsi que le referentiel d'entreprises
- les `entreprises` ne voient que leurs propres donnees

### Publication

- une offre non validee n'est visible que par son auteur et l'equipe
  pedagogique
- une offre validee devient visible aux etudiants
- une offre prise n'est plus disponible pour une nouvelle attribution
- une offre non disponible n'est plus ouverte aux candidatures

### Decision de l'entreprise sur les candidatures

Sur une offre publiee, l'entreprise peut consulter les etudiants ayant postule
et en retenir un. Ce choix conduit a l'etat `prise`.

Le gestionnaire doit pouvoir cloturer une offre qui n'est plus disponible sans
avoir ete attribuee a l'un de nos etudiants. Dans ce cas, il place l'offre dans
l'etat `non_disponible`.

### Doublons entreprise

Le risque de doublon entreprise est frequent, en particulier lors d'une
proposition deposee par un etudiant. La V1 doit donc imposer les garde-fous
suivants:

- recherche obligatoire avant creation d'une entreprise
- affichage de correspondances probables lorsque le nom saisi ressemble a une
  entreprise existante
- capacite pour l'equipe pedagogique de corriger la reference choisie

La fusion avancee de doublons peut etre reportee a un plan technique minimal si
necessaire, mais la prevention des doublons doit etre presente des la V1.

### Validation des donnees

La V1 doit inclure une validation de base sur:

- emails
- telephones
- champs obligatoires
- coherence entre teletravail et pourcentage de teletravail
- presence d'au moins un contact entreprise
- presence d'un contact prioritaire sur chaque offre

## Experience Utilisateur

### Tableau de bord gestionnaire

Le gestionnaire doit retrouver rapidement:

- les offres soumises en attente
- les entreprises nouvellement creees ou suspectes de doublon
- les offres a cloturer comme non disponibles si necessaire
- l'import CSV des etudiants
- la recherche globale

### Tableau de bord lecteur

Le lecteur accede a des vues de consultation sur:

- offres
- entreprises
- contacts
- candidatures

### Tableau de bord etudiant

L'etudiant voit:

- une liste d'offres validees
- un acces au referentiel d'entreprises, meme sans offre publiee
- des filtres simples
- un acces a la candidature
- un acces au depot de proposition

### Tableau de bord entreprise

L'entreprise voit:

- son profil
- ses contacts
- ses offres
- le statut de ses offres
- les candidatures recues sur ses offres

## Trajectoire V2 Compatible

Le design V1 doit rester compatible avec:

- un futur SSO Microsoft pour les etudiants
- un workflow de candidatures plus detaille
- l'ajout de conventions et documents administratifs
- un enrichissement futur des statuts

Cette compatibilite ne doit pas pousser a surconcevoir la V1. Le but est de
poser des objets et des roles stables, pas d'anticiper toute la V2.

## Decisions Retenues

- une seule application web multi-roles
- un espace pedagogique a deux niveaux de droits: gestionnaire et lecteur
- un mini-espace entreprise avec plusieurs offres et suivi des statuts
- un espace etudiant pour consulter, proposer et postuler
- la consultation des entreprises par les etudiants, meme sans offre
- import CSV comme mode initial de chargement des etudiants
- formulaire leger pour les propositions initiees par les etudiants
- prevention des doublons entreprise des la V1
- email general obligatoire sur l'entreprise
- au moins un contact entreprise obligatoire
- un contact prioritaire obligatoire sur chaque offre
- possibilite pour l'entreprise de retenir un candidat
- possibilite pour le gestionnaire de cloturer une offre comme non disponible
- workflow V1 volontairement court, sans traitement aval complet

## Questions Reportees A La Phase De Plan

Ces sujets ne bloquent pas le design fonctionnel mais devront etre arbitres dans
le plan technique:

- mode exact d'authentification V1 pour les entreprises
- niveau de detail du schema CSV d'import etudiant
- format, taille et stockage des pieces jointes
- regles exactes de recherche approximative des entreprises
- detail des champs obligatoires pour chaque formulaire
