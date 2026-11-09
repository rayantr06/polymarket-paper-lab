# Polymarket Paper Lab

Test prospectif de logiciel, en argent fictif, sur trois adresses publiques. Le but est de mesurer ce qui reste d'une copie après le délai, le spread, les frais et les contraintes de profondeur. Aucun portefeuille connecté, aucune clé privée, aucun ordre réel.

| Profil public | Périmètre testé | Adresse stable |
|---|---|---|
| Multicoloured-Serf | Football avant match | `0x958bdb8aa30b8e5bd1fe4ee071f309c84e97f826` |
| aschenbrenner | Prix national Regular AAA aux États-Unis | `0xc8b13df44dc3ea8e53b1d6a840ae5f879dd18436` |
| LllLH | Prix national Regular AAA aux États-Unis | `0xe9f5d0aab304d41ff037436d2d920524ed6d7368` |

Les noms sont modifiables. Ces profils constituent des candidats sélectionnés, pas des preuves de compétence prédictive ni d'information privilégiée.

[Bilan actualisé](https://github.com/rayantr06/polymarket-paper-lab/blob/results/bilan.md) · [Exécution cloud](https://github.com/rayantr06/polymarket-paper-lab/actions/workflows/paper.yml)

## Protocole figé avant lancement

La première session fixe sept jours de capture puis deux jours pour attendre les résolutions. Chaque reprise garde les mêmes dates, la même révision et le même curseur. Un état manquant après la première session provoque un arrêt. Les horloges sont comparées à l'horloge publique CLOB.

Un inventaire initial exclut les événements déjà détenus. Un premier ordre observé cumulant au moins 10 pUSD, confirmé dans un reçu Polygon, peut ouvrir un cas sur un nouvel événement. Les remplissages d'un même ordre sont agrégés. Une exécution maker ne date pas le placement de cet ordre.

Chaque cas produit trois scénarios **alternatifs**, à 1, 5 et 15 minutes après sa réception effective. Une tolérance de 90 secondes tient compte de la lecture par minute. Une fenêtre manquée reste manquée : aucun carnet passé n'est reconstruit. L'entrée doit précéder l'événement d'au moins 30 minutes, avec une échéance à moins de 48 heures.

Au moment de chaque scénario, le programme récupère les positions ouvertes et copie proportionnellement les parts du panier sur le même événement économique. Toutes les jambes doivent être exécutables dans un budget fictif de 100 pUSD. Plus de quatre jambes, pagination incomplète, petites couvertures sous le minimum, règles inconnues, données trop anciennes ou liquidité insuffisante entraînent une abstention du panier entier. Les inventaires de plusieurs pages ne sont pas atomiques.

La profondeur vendeuse est consommée virtuellement, avec les frais taker du contrat et un coût supplémentaire conservateur de 0,02 pUSD par jambe. Les prix des asks incluent l'effet du spread à l'achat. Les instantanés WebSocket fraîchement servis conservent aussi leur date de modification native. La liquidité n'est pas réservée et l'exécution simultanée des jambes n'est pas garantie. Le test peut encore surestimer la faisabilité réelle.

Chaque wallet/méthode/délai dispose d'un capital fictif de 500 pUSD. Les scénarios ne s'additionnent pas. Les positions sont conservées jusqu'au paiement final, vérifié sur deux RPC au même bloc. Les ventes du wallet ne sont pas répliquées ; on teste une stratégie de copie avec conservation. Un diagnostic séparé aux bids dix minutes avant le match ne modifie pas le portefeuille ni son capital. Les récompenses sont exclues. Les positions non résolues restent inconnues à la fin.

Pour AAA, deux témoins ponctuels utilisent uniquement une observation reçue avant le signal : persistance de la dernière valeur et prolongation de sa variation quotidienne. Le programme vérifie une partition complète des seuils, la colonne Regular à quatre décimales et la date publiée. Ces témoins ne sont pas des probabilités calibrées. Une valeur du jour cible déjà publiée n'est pas une anticipation. Les deux wallets AAA et les paris d'une même journée sont corrélés.

## Exécution gratuite et conservation

Le workflow manuel unique utilise uniquement `ubuntu-latest`, runner standard gratuit dans un dépôt public. Aucun autre dépôt ni projet cloud n'est sollicité. Aucun budget payant n'est augmenté.

Les 90 sessions successives de 145 minutes couvrent au maximum neuf jours, avec de courtes pauses de reprise. Le dernier état SQLite est conservé dans le cache Actions du dépôt (plafond propre de 10 Go), sous des clés liées au même run. Le plafond local de 40 Mio borne à moins de 3,6 Gio les 90 états maximaux. Le cache peut être évincé : son absence interrompt le test. Une panne de runner peut perdre les observations depuis la dernière sauvegarde, au plus une session ; ce trou doit être signalé. Une pause normale peut aussi faire manquer un scénario de prix.

Chaque session publie uniquement le dernier bilan et son JSON dans la branche `results`. Le journal complet final est proposé comme artefact compressé conservé deux jours. Le stockage d'artefacts partage le quota du compte ; l'échec de cet export ne crée pas d'achat et n'efface pas le cache. Les rapports publics restent dans la branche `results`. Les requêtes sont plafonnées à 60 000. À 32 Mio, les nouvelles entrées cessent pour réserver la place aux résultats des positions existantes.

Le workflow s'arrête seul à l'échéance. Les étapes suivantes sont sautées. Une erreur bloquante arrête la chaîne et se consulte dans Actions ; une relance des jobs échoués garde le même run et exige la sauvegarde. Ne pas démarrer une deuxième campagne pour contourner une erreur.

Les artefacts, caches, sources et résultats de ce dépôt sont publics. Il ne contient aucun historique ni fichier de recherche du dépôt privé d'origine. Quelques fonctions de lecture et de contrôle du carnet ont été réutilisées dans ce collecteur autonome.

## Vérification et lecture

Node 24, aucune dépendance installée : `node --test test/*.test.mjs`. Le collecteur refuse une exécution continue hors de GitHub Actions ; `--once` permet un contrôle ponctuel local dans un dossier distinct.

Comparer le net **sur les cas résolus**, les abstentions et les montants immobilisés, par événement et par scénario. Une absence de perte ou un taux de réussite élevé sur quelques cas ne suffit pas. Aucune rentabilité n'est présumée avant les résultats prospectifs. Les interruptions et historiques incomplets font partie du bilan.

Sources : [tarification Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [limites Actions](https://docs.github.com/en/actions/reference/limits), [source officielle AAA](https://gasprices.aaa.com/).
