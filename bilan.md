# Observation indépendante AAA du 10 novembre 2026

État : **target-value-observed**, rapport au 2026-11-10T10:39:30.812Z.

[Run GitHub](https://github.com/rayantr06/polymarket-paper-lab/actions/runs/42722136789) · [Source AAA](https://gasprices.aaa.com/) · [Méthode de publication AAA](https://gasprices.aaa.com/about-aaa/) · [Preuves structurées](preuves.json)

Fenêtre fixe : 2026-11-09T23:33:18.744Z → 2026-11-10T19:33:18.744Z. Révision : a92b89b4e7f72951295606128e6f552fca273cf6.

## Trois heures à distinguer

AAA annonce une mise à jour quotidienne vers **03:00 ET** (2026-11-10T08:00:00.000Z pour ce jour). Le contrat observe la source à **10:00 ET** (2026-11-10T15:00:00.000Z). L’observateur utilise l’heure réelle de réception intégrale de chaque page.
Première valeur cible reçue : **2026-11-10T08:25:33.699Z**, Regular **4.0093 USD/gallon**, date 2026-11-10. Dernière réception ancienne : 2026-11-10T08:24:33.672Z. Début censuré : non. Continuité de l’intervalle observé : compatible avec la cadence.

Dernière source : 2026-11-10, 3.9788 ; cache Age=230. 652 lectures ; 0 erreurs ; 0 interruptions consignées.

## Expériences virtuelles après première réception

Chaque délai est un portefeuille alternatif de 50 pUSD fictifs. Achat du Yes correspondant à la première valeur reçue, aux asks et frais courants, plus 0.02 pUSD par entrée. Ce n’est pas une prévision avant publication.

| Délai demandé | Action | Prix moyen | Frais | Coût | Marge conditionnelle | Net à résolution vérifiée |
|---|---|---:|---:|---:|---:|---:|
| 1 min | abstain | — | — | — | — | — |
| 5 min | abstain | — | — | — | — | — |
| 15 min | abstain | — | — | — | — | — |

- 1 min : Yesterday Avg does not match the prior-day value actually known at seed receipt
- 5 min : Yesterday Avg does not match the prior-day value actually known at seed receipt
- 15 min : Latest known AAA source differs from first choice; no entry

## Wallets et carnets

0 actions du jour cible reçues ; 551 lectures de couverture. Les données d’exécution ne donnent pas l’heure de placement des ordres. 105 diagnostics de carnet avant réception cible, espacés d’environ cinq minutes. Aucun mouvement entre ces points n’est reconstitué.

## Limites

- One target day; three delay scenarios are alternatives, not independent gains.
- AAA indicates updates around 03:00 ET; contract observation is 10:00 ET. Neither is a measured global publication timestamp.
- First target receipt is local to this observer and can lag cache/CDN publication. Old/new receipt brackets are descriptive, not certainty that the source was unpublished elsewhere.
- A value observed before 10am can change before the contract observation. First choice is retained and any later different payout remains a loss.
- Yesterday Avg must match the prior-day value received at seed creation. That reference is not an independently certified historical 10am observation.
- Only source information known before the quote authorizes a decision. Later source changes are preserved as subsequent evidence, never applied retroactively.
- Wallet execution timestamp does not date order placement or establish the information known to its owner.
- Depth is served state without reserved liquidity or guaranteed fills. Periodic pre-release books retain only twenty best levels per side.
- Simulated known-number purchases have no calibrated advance probability. Margins remain conditional until verified resolution; unknown payouts have unknown net.
- No actual order, private key or modification of existing pilots.
