# Observation de la publication AAA

Expérience indépendante sur le relevé national Regular du **10 novembre 2026**. Elle complète le test de copie de ce dépôt, avec ses propres fichiers, workflow, SQLite, cache et branche de résultats. Elle ne change aucun réglage du test initial ni des autres projets. Aucun ordre réel, clé ou compte de trading.

[Rapport AAA](https://github.com/rayantr06/polymarket-paper-lab/blob/aaa-source-results/bilan.md) · [Workflow dédié](https://github.com/rayantr06/polymarket-paper-lab/actions/workflows/aaa-source.yml).

## Question et chronologie

[AAA annonce](https://gasprices.aaa.com/about-aaa/) une mise à jour quotidienne vers **3 h ET**, soit **08 h UTC / minuit Los Angeles** ce jour-là. Les six contrats gelés dans `seed.json` constatent le prix à **10 h ET / 15 h UTC / 07 h Los Angeles**, avec leurs conditions de date, de veille et de secours. Ces deux heures ne sont pas une première publication effectivement mesurée.

La fenêtre fixe de vingt heures est enregistrée dans `policy.json`. L'observateur lit la source environ chaque minute, les deux wallets chaque deux minutes et les carnets avant première valeur cible chaque cinq minutes. Il recoupe bandeau, date et cellule Regular, conserve les quatre décimales, les révisions, les heures de réception complète, l'empreinte et les en-têtes cache. Le HTML AAA complet n'est pas publié. Le cache peut décaler notre vue ; l'intervalle dernière page ancienne/première page cible décrit une bascule observée, pas la disponibilité mondiale. Une valeur cible déjà présente au premier passage est marquée comme telle, sans heure d'apparition inventée.

## Trois simulations conditionnelles

À **1, 5 et 15 minutes après première réception du chiffre cible**, l'expérience demande un nouveau carnet complet du Yes correspondant. Chaque délai est un portefeuille alternatif de **50 pUSD fictifs**. Frais courants, profondeur, minimum en parts et provision de **0,02 pUSD** s'appliquent. Un délai manqué de plus de 90 secondes, une source trop ancienne ou révisée, une veille incohérente avec la valeur reçue au gel, un carnet invalide ou une marge conditionnelle non positive entraînent une abstention.

La comparaison de la veille utilise la version effectivement reçue pendant la préparation ; elle ne certifie pas rétroactivement le relevé de 10 h du 9 novembre. La décision utilise seulement la source reçue avant le carnet. Les contrôles suivants sont consignés séparément sans modifier l'entrée passée. La source n'est jamais sollicitée à moins de dix secondes d'écart. Avant publication, les diagnostics retiennent les vingt meilleurs niveaux par côté, avec la date native du carnet séparée de sa réception fraîche.

Acheter après connaissance du chiffre **n'est pas une prévision avant publication**. Le prix peut changer avant 10 h, et les règles de secours peuvent compter. La marge `parts − coût` reste conditionnelle au paiement du Yes choisi. Le résultat final utilise deux RPC au même bloc Polygon ; un paiement différent peut produire une perte, un paiement absent reste inconnu. Les scénarios ne s'additionnent pas. La liquidité n'est pas réservée et la simulation ne prouve pas un remplissage réel.

## Hébergement et reprise

Déclenchement manuel unique de `aaa-source.yml` sur runner Ubuntu standard public gratuit, six sessions de 220 minutes maximum. Même politique, graine, commit et run requis ; perte de mémoire ou provenance discordante provoquent un arrêt, sans nouvelle fenêtre. Aucun budget supplémentaire n'est augmenté. Plafonds : 15 000 requêtes et 40 Mio de SQLite.

État dans `aaa-checkpoint/observer.sqlite`, cache préfixé `aaa-source-20261110-v1-`. La branche **aaa-source-results** reçoit uniquement les trois rapports de cet observateur. Le test de copie conserve sa branche **results**, son cache, son manifeste et sa révision d'origine. Les rapports sont publiés au démarrage et à la fin de chaque session ; l'absence de nouvelle publication entre deux sessions ne signifie pas que le processus est arrêté. Export final facultatif, rétention deux jours ; aucun achat si le quota d'artefacts est insuffisant.

En cas d'erreur, inspecter les jobs du même run et le dernier cache avant toute reprise. Ne pas déclencher de doublon ni reconstruire les prix manqués. Le PC peut être éteint ; ce workflow publie sur GitHub sans envoyer de message automatique dans le chat.

## Vérification

`node --test aaa/test.mjs` vérifie causalité, cache, révisions, provenance, espacement des requêtes, abstentions et résultats défavorables. Une vérification locale finie utilise `node aaa/run.mjs --init --once --directory CHEMIN_DISTINCT` ; la collecte continue requiert le dépôt GitHub dédié.
