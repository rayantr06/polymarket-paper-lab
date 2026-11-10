# Test virtuel prospectif de trois wallets

État : **capture**. Bilan généré le 2026-11-10T15:19:34.673Z.

Capture : 2026-11-09T22:23:13.235Z → 2026-11-16T22:23:13.235Z. Résolutions suivies jusqu’au 2026-11-18T22:23:13.235Z.
Dernier passage : 2026-11-10T15:18:40.054Z. 1015 passages, 3361 requêtes publiques.
Révision : eab384b7aefae412058973b289279840a22e0449. Run : [42711347661](https://github.com/rayantr06/polymarket-paper-lab/actions/runs/42711347661).

0 nouveaux cas ; 0 décisions incluant les abstentions. 0 interruptions de lecture consignées ; 0 erreurs (0 exemples par portée/heure).

| Wallet | Délai | Méthode | Paniers | Résolus | Non résolus | Net résolu (pUSD) |
|---|---:|---|---:|---:|---:|---:|
| Multicoloured-Serf | 1 min | wallet | 0 | 0 | 0 | 0.0000 |
| Multicoloured-Serf | 5 min | wallet | 0 | 0 | 0 | 0.0000 |
| Multicoloured-Serf | 15 min | wallet | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 1 min | wallet | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 1 min | persistence | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 1 min | trend | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 5 min | wallet | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 5 min | persistence | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 5 min | trend | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 15 min | wallet | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 15 min | persistence | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 15 min | trend | 0 | 0 | 0 | 0.0000 |
| LllLH | 1 min | wallet | 0 | 0 | 0 | 0.0000 |
| LllLH | 1 min | persistence | 0 | 0 | 0 | 0.0000 |
| LllLH | 1 min | trend | 0 | 0 | 0 | 0.0000 |
| LllLH | 5 min | wallet | 0 | 0 | 0 | 0.0000 |
| LllLH | 5 min | persistence | 0 | 0 | 0 | 0.0000 |
| LllLH | 5 min | trend | 0 | 0 | 0 | 0.0000 |
| LllLH | 15 min | wallet | 0 | 0 | 0 | 0.0000 |
| LllLH | 15 min | persistence | 0 | 0 | 0 | 0.0000 |
| LllLH | 15 min | trend | 0 | 0 | 0 | 0.0000 |

Un zéro sans panier résolu ne constitue pas un rendement nul : aucun résultat évaluable pour ce scénario.

## Couverture

- Multicoloured-Serf : 1015 lectures complètes ; dernier succès 2026-11-10T15:18:39.790Z ; 1 événements déjà détenus exclus.
- aschenbrenner : 1015 lectures complètes ; dernier succès 2026-11-10T15:18:39.921Z ; 0 événements déjà détenus exclus.
- LllLH : 1015 lectures complètes ; dernier succès 2026-11-10T15:18:40.053Z ; 1 événements déjà détenus exclus.


## Abstentions


## Limites

- Étude prospective descriptive ; aucune probabilité de gain démontrée.
- Chaque scénario 1/5/15 minutes est alternatif ; ne pas additionner leurs gains.
- Les deux wallets AAA et les positions du même événement sont corrélés ; aucune indépendance supposée.
- Copie proportionnelle du panier détenu à réception ; conservation jusqu’au paiement final. Les ventes du wallet ne sont pas répliquées.
- Prix aux asks et profondeur observés, frais et coût de 0,02 par jambe. Liquidité non réservée, remplissage simultané non garanti.
- Première exécution maker observée différente de la date de placement de l’ordre.
- Les cas initiaux déjà détenus sont exclus. Les délais manqués deviennent des abstentions.
- Persistance et tendance AAA sont des prévisions ponctuelles non calibrées ; aucun rendement espéré chiffré.
- Les paiements non résolus restent inconnus ; récompenses exclues. Aucun ordre réel.
