# Scoring Algorithm — Deep Reference

## Weighted Average Formula

```
weighted_score = Σ(rating_i × multiplier_i) / Σ(multiplier_i)
```

Where `multiplier_i` comes from the reviewer's hunter level:

| Level | Key | Multiplier |
|-------|-----|------------|
| Apprenti Gourmet | `apprenti` | x1.0 |
| Palais Éveillé | `palais_eveille` | x1.5 |
| Chasseur Confirmé | `chasseur_confirme` | x2.0 |
| Maître du Goût | `maitre` | x3.0 |
| Génie du Palais | `genie` | x5.0 |

## Example Calculation

5 reviews on a restaurant:
- 3 Apprentis rate 4/5 → weight = 3 × 1.0 = 3.0, weighted sum = 12
- 1 Maître rates 3/5 → weight = 3.0, weighted sum = 9
- 1 Génie rates 3/5 → weight = 5.0, weighted sum = 15

**Simple average**: (4+4+4+3+3) / 5 = **3.6**
**Weighted average**: (12 + 9 + 15) / (3 + 3 + 5) = 36 / 11 = **3.27**

Expert opinions intentionally carry more weight.

## When to Recalculate

Recalculate `restaurant_stats.weighted_score` whenever:
1. A new review is created
2. A review is updated (rating changed)
3. A review is deleted/soft-deleted
4. A hunter's level changes (level-up affects their past reviews' weight)

## Sub-criteria (Full Review Only)

Full reviews have 4 sub-criteria, each rated 1-5:
- `taste_rating` — Goût
- `service_rating` — Service
- `ambiance_rating` — Ambiance
- `value_rating` — Rapport qualité/prix

These are stored individually for analytics but the main `rating` (1-5 global) is what feeds the weighted score.

## Score of Confidence (Internal)

Each hunter has a non-displayed confidence score affecting their review trustworthiness:

| Signal | Effect |
|--------|--------|
| Consistent ratings over time | +confidence |
| Reviews frequently liked by others | +confidence |
| All-5-star pattern detected | -confidence |
| Reviews frequently reported | -confidence |
| GPS/EXIF inconsistencies | -confidence |

Phase 2: confidence score will multiply review weight (e.g., 0.5 × multiplier for low-trust users).

## Points by Action

| Action | Base Points | Condition |
|--------|-------------|-----------|
| Check-in | 5 | GPS verified |
| Quick Snap | 5 | Photo + 3 emojis |
| Full Review | 15 | Photo + 250+ chars + sub-criteria |
| First Discoverer | +50 bonus | First-ever review on restaurant |
| Useful Review | +20 bonus | 10+ likes received |
| Group Hunt | x2 multiplier | 2+ hunters, all GPS verified |
| Hunt Marathon | 300 flat | 3+ different restaurants in 24h |

## Anti-Abuse Limits

| Rule | Value | Scope |
|------|-------|-------|
| GPS radius | < 100m | Per review |
| Cooldown | 24h | Per user per restaurant |
| Daily reviews | Max 10 | Per user |
| Daily points | Max 500 | Per user |
| Daily clan points | Max 500 | Per clan |
| Clan switch cooldown | 7 days | Per user |

## Streak Bonuses

| Consecutive Days | Badge | Points Multiplier |
|------------------|-------|-------------------|
| 7 | Fire Hunter | +10% |
| 30 | Unstoppable | +15% |
| 100 | Legend | +20% |

Streak resets to 0 on miss. No protection mechanism.
