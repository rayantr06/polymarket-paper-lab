# Test virtuel prospectif de trois wallets

État : **capture**. Bilan généré le 2026-11-11T17:57:06.954Z.

Capture : 2026-11-09T22:23:13.235Z → 2026-11-16T22:23:13.235Z. Résolutions suivies jusqu’au 2026-11-18T22:23:13.235Z.
Dernier passage : 2026-11-11T17:56:11.909Z. 2610 passages, 8871 requêtes publiques.
Révision : eab384b7aefae412058973b289279840a22e0449. Run : [42711347661](https://github.com/rayantr06/polymarket-paper-lab/actions/runs/42711347661).

3 nouveaux cas ; 27 décisions incluant les abstentions. 0 interruptions de lecture consignées ; 1 erreurs (1 exemples par portée/heure).

| Wallet | Délai | Méthode | Paniers | Résolus | Non résolus | Net résolu (pUSD) |
|---|---:|---|---:|---:|---:|---:|
| Multicoloured-Serf | 1 min | wallet | 0 | 0 | 0 | 0.0000 |
| Multicoloured-Serf | 5 min | wallet | 0 | 0 | 0 | 0.0000 |
| Multicoloured-Serf | 15 min | wallet | 0 | 0 | 0 | 0.0000 |
| aschenbrenner | 1 min | wallet | 1 | 0 | 1 | 0.0000 |
| aschenbrenner | 1 min | persistence | 1 | 1 | 0 | -100.0000 |
| aschenbrenner | 1 min | trend | 2 | 1 | 1 | 1.0420 |
| aschenbrenner | 5 min | wallet | 2 | 1 | 1 | 1.3945 |
| aschenbrenner | 5 min | persistence | 2 | 1 | 1 | -100.0000 |
| aschenbrenner | 5 min | trend | 2 | 1 | 1 | 1.3945 |
| aschenbrenner | 15 min | wallet | 1 | 0 | 1 | 0.0000 |
| aschenbrenner | 15 min | persistence | 2 | 1 | 1 | -100.0000 |
| aschenbrenner | 15 min | trend | 2 | 1 | 1 | 0.9620 |
| LllLH | 1 min | wallet | 1 | 0 | 1 | 0.0000 |
| LllLH | 1 min | persistence | 1 | 0 | 1 | 0.0000 |
| LllLH | 1 min | trend | 1 | 0 | 1 | 0.0000 |
| LllLH | 5 min | wallet | 1 | 0 | 1 | 0.0000 |
| LllLH | 5 min | persistence | 1 | 0 | 1 | 0.0000 |
| LllLH | 5 min | trend | 1 | 0 | 1 | 0.0000 |
| LllLH | 15 min | wallet | 1 | 0 | 1 | 0.0000 |
| LllLH | 15 min | persistence | 1 | 0 | 1 | 0.0000 |
| LllLH | 15 min | trend | 1 | 0 | 1 | 0.0000 |

Un zéro sans panier résolu ne constitue pas un rendement nul : aucun résultat évaluable pour ce scénario.

## Couverture

- Multicoloured-Serf : 2610 lectures complètes ; dernier succès 2026-11-11T17:56:11.598Z ; 1 événements déjà détenus exclus.
- aschenbrenner : 2610 lectures complètes ; dernier succès 2026-11-11T17:56:11.752Z ; 0 événements déjà détenus exclus.
- LllLH : 2610 lectures complètes ; dernier succès 2026-11-11T17:56:11.906Z ; 1 événements déjà détenus exclus.


## Abstentions

- aschenbrenner, 1 min, wallet : 1 × HTTP 429 data-api.polymarket.com.
- aschenbrenner, 1 min, persistence : 1 × Invalid, stale or unavailable basket leg.
- aschenbrenner, 15 min, wallet : 1 × HTTP 429 data-api.polymarket.com.

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
