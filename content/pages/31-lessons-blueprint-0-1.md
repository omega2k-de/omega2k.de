---
id: '31'
parent: '30'
slug: 'lessons-blueprint-0-1'
topic: 'lessons'
route: '/content/lessons/blueprint-0-1'
title: 'Lessons learned: Parameter-Blaupause'
description: 'Parameter-Blaupause für das proto-Superorganismus 2.0 / WT-System'
keywords: 'Parameter blueprint Superorganismus System WT Token Weighted Strukturvariablen Zonenstruktur'
version: 1
createdAt: '2025-12-05T22:48:12.791Z'
---

# Parameter-Blaupause: proto-Superorganismus 2.0 / WT-System

## 1. Globale Strukturvariablen

| Name            | Beschreibung                                                                 | Typ / Einheit         |
|-----------------|------------------------------------------------------------------------------|------------------------|
| `N`             | Anzahl der Einwohner:innen im betrachteten System (z.B. Kommune, Region)    | Integer                |
| `P`             | Betrachtungsperiode (Standard: 1 Monat)                                     | Zeitintervall          |
| `H_max_total`   | Max. Arbeitsstunden pro Person und Monat (alle Zonen zusammen)              | Stunden / Monat        |
| `H_min_regen`   | Mindest-Regenerationszeit (Nicht-Arbeitszeit) pro Person und Monat          | Stunden / Monat        |
| `WT`            | Einheit „Weighted Time Token“ (gewichtete Arbeitsstunde)                    | Zeiteinheit mit Faktor |

---

## 2. Zonenstruktur (WT-Zonen)

Es gibt eine Menge von Zonen `Z = {Z₁, …, Z_k}`, die verschiedene Tätigkeitsbereiche repräsentieren
(Basisversorgung, Care, Markt, Luxus, Risiko usw.). Jede Zone `Z_i` hat eigene Systemparameter.

| Name             | Beschreibung                                                                                           | Typ / Einheit                  |
|------------------|--------------------------------------------------------------------------------------------------------|--------------------------------|
| `Z_i`            | i-te Zone (z.B. Basisversorgung, Care, Markt, Luxus …)                                                | Kategorie                      |
| `g_i`            | Gemeinwohlfaktor der Zone (0,5–3,0 o.ä.): gesellschaftlicher Nutzen pro Stunde                         | dimensionslos                  |
| `q_i`            | Qualifikations-/Risikofaktor (Belastung, Verantwortung, Spezialisierung)                              | dimensionslos                  |
| `WT_rate_i`      | WT pro Stunde in Zone i (z.B. `WT_rate_i = 1h * g_i * q_i`)                                           | WT / Stunde                    |
| `H_max_i`        | Max. zulässige Stunden pro Person in Zone i pro Monat (Gesundheit/Burnout-Schutz)                     | Stunden / Monat                |
| `H_min_i`        | Ggf. erforderliche Mindeststunden (z.B. Mindest-Care-Beitrag, Gemeinschaftsdienst)                    | Stunden / Monat                |
| `cap_pop_i`      | System-Cap: max. Gesamtstunden in Zone i pro 1000 Einwohner:innen                                      | Stunden / Monat / 1000 Ew.     |
| `convert_EUR_i`  | Regel zur Konvertierbarkeit von EUR→WT in Zone i (erlaubt / begrenzt / verboten)                      | Regel                          |
| `convert_WT_i`   | Regel, welche Leistungen in WT aus Zone i bezahlt werden dürfen (Miete, Bildung, Gesundheit, ÖPNV)    | Regel                          |
| `priority_i`     | Prioritätsstufe der Zone (Basis > Komfort > Luxus) für Zuteilungs-/Rationierungslogik                 | Rang (1..k)                    |

---

## 3. Zeitboden / Grundsicherung in WT

Der „Zeitboden“ ist eine pro Kopf garantierte WT-Grundausstattung
bzw. ein Mindestanspruch an gemeinwohlorientierten Leistungen.

| Name                 | Beschreibung                                                                                          | Typ / Einheit |
|----------------------|-------------------------------------------------------------------------------------------------------|---------------|
| `WT_floor`           | Garantierter WT-Anspruch pro Person und Monat (z.B. für Wohnen, Grundversorgung)                     | WT / Monat    |
| `WT_floor_share_i`   | Anteil des Zeitbodens, der nur für bestimmte Zonen/Leistungen genutzt werden darf                    | Anteil 0–1    |
| `WT_floor_eligibility(p)` | Regel, wer welchen Zeitboden erhält (alle, Kinder, Erwerbslose, Pflegebedürftige, etc.)         | Funktion      |
| `WT_floor_index`     | Indexierungsregel des Zeitbodens (z.B. Kopplung an Lebenshaltungskosten, Mieten, Gesundheitskosten)  | Regel         |

---

## 4. Individuelle Variablen / Personas

Für jede Persona `p` gibt es einen Satz individueller Parameter.
Personas sind Modell-Typen (z.B. alleinstehende Pflegekraft, Alleinerziehende,
chronisch Kranke, Manager, Studierende, Rentner:in).

| Name               | Beschreibung                                                                                         | Typ / Einheit  |
|--------------------|------------------------------------------------------------------------------------------------------|----------------|
| `H_total(p)`       | Verfügbare Arbeitszeit pro Monat (inkl. Begrenzung durch Gesundheit & Care-Pflichten)                | Stunden / Monat|
| `H_zone_i(p)`      | Tatsächlich in Zone i geleistete Stunden pro Monat                                                   | Stunden / Monat|
| `H_care_unpaid(p)` | Unbezahlte Care-Arbeit (Soll im Zielmodell in eine WT-Zone überführt werden)                         | Stunden / Monat|
| `WT_income(p)`     | WT-Einkommen der Persona: `WT_income(p) = Σ_i H_zone_i(p) * WT_rate_i`                               | WT / Monat     |
| `WT_spend(p)`      | In der Periode verausgabte WT (Wohnen, Bildung, Gesundheit, Versorgung)                              | WT / Monat     |
| `WT_balance(p)`    | WT-Saldo: `WT_income(p) + WT_floor(p) − WT_spend(p)`                                                 | WT / Monat     |
| `EUR_income(p)`    | Markt-/Geldeinkommen (Lohn, Transfers, Rente etc.)                                                   | EUR / Monat    |
| `EUR_to_WT_limit(p)` | Obere Grenze, wie viel EUR pro Monat in WT getauscht werden darf (Anti-Aufkauf)                   | WT / Monat     |
| `WT_to_EUR_limit(p)` | Obere Grenze für Rücktausch WT→EUR (Anti-Spekulation)                                              | WT / Monat     |
| `health_index(p)`  | Gesundheitliche Belastbarkeit (Grenze für Arbeitsstunden, Ausschluss bestimmter Zonen möglich)       | Skala / 0–1    |
| `care_need(p)`     | Eigenes Pflege-/Versorgungsbedürfnis (→ Mindest-WT, Vorrang in Leistungen)                           | Skala          |

### 4.1 Präferenzstruktur pro Persona

| Name              | Beschreibung                                                              |
|-------------------|---------------------------------------------------------------------------|
| `pref_zone_i(p)`  | Präferenz der Persona für Tätigkeiten in Zone i (hoch/mittel/niedrig)    |
| `pref_risk(p)`    | Bereitschaft, riskantere/höher gewichtete Tätigkeiten zu übernehmen      |
| `pref_stability(p)` | Präferenz für stabile vs. volatile WT-Einkommen                         |

---

## 5. Rotations- und Verteilungsregeln

Regeln, damit das System nicht „klebt“ (kein dauerhaftes Festhängen in ungesunden Zonen).

| Name / Regel        | Beschreibung                                                                                   |
|---------------------|------------------------------------------------------------------------------------------------|
| `rotation_cycle_i`  | Maximale Dauer, die eine Person zusammenhängend in belastender Zone i tätig sein darf         |
| `cooldown_i`        | Mindestpause zwischen zwei Einsätzen in Zone i                                                 |
| `access_rule_i(p)`  | Kriterien für Zugang zu Zone i (Qualifikation, Gesundheit, demokratische Zuteilung, Los)      |
| `quota_vulnerable_i`| Mindestquote geschützter Gruppen, die **nicht** in belastende Zonen gelangen dürfen           |
| `quota_rotation_i`  | Zielanteil von Personen, die Rotationsangebote tatsächlich nutzen bzw. Cap auf Dauerbesetzung |

---

## 6. Caps und Systembegrenzungen

Begrenzungen zur Einhegung von Spekulation und Überlastung.

| Name                | Beschreibung                                                                                         | Typ / Einheit |
|---------------------|------------------------------------------------------------------------------------------------------|---------------|
| `WT_cap_personal`   | Maximaler WT-Bestand pro Person (oberhalb ggf. Abschmelzung/Umlaufimpuls)                           | WT            |
| `WT_savings_window` | Zeitraum, über den WT unverändert gehalten werden dürfen, bevor Abschmelzlogik greift               | Monate        |
| `WT_cap_zone_i`     | Max. Summe an WT, die in Zone i im Umlauf sein darf (z.B. Begrenzung Luxus-Zone)                    | WT / Monat    |
| `WT_cap_service_j`  | Cap pro Leistungstyp (z.B. max. WT-Anteil an Wohnkosten, um Verdrängungseffekte zu vermeiden)       | WT / Monat    |
| `trade_cap_EUR_WT`  | Globales Limit für systemweite Konvertierungen EUR↔WT pro Periode                                   | WT / Monat    |

---

## 7. Charta- und Teil-V-Zieldimensionen (Prüfvariablen)

Diese Größen werden verwendet, um jede Parameter-Variante gegen die Charta
und das Teil-V-Prüfschema zu testen.

### 7.1 Ökologische Integrität

| Name                 | Beschreibung                                                               |
|----------------------|----------------------------------------------------------------------------|
| `ECO_footprint_total`| Gesamtressourcen-/Emissionsfußabdruck pro 1000 Einwohner:innen            |
| `ECO_cap`            | Zulässiger Höchstwert (kompatibel mit planetaren Grenzen)                 |
| `ECO_zone_i`         | Ökologische Last pro Stunde in Zone i (Energie, Fläche, Emissionen etc.)  |

### 7.2 Soziale Gerechtigkeit

| Name               | Beschreibung                                                                                   |
|--------------------|------------------------------------------------------------------------------------------------|
| `GINI_WT`          | Ungleichheitsmaß über WT-Einkommen/Bestände                                                   |
| `GINI_EUR`         | Ungleichheitsmaß über EUR-Einkommen/Bestände                                                 |
| `deprivation_rate` | Anteil der Personen, die Grundbedürfnisse trotz Zeitboden + WT nicht decken können           |
| `care_gap`         | Differenz zwischen benötigter und tatsächlich geleisteter/vergüteter Care-Arbeit             |

### 7.3 Demokratie / Mitbestimmung

| Name                 | Beschreibung                                                                                       |
|----------------------|----------------------------------------------------------------------------------------------------|
| `DEM_participation`  | Anteil der Bevölkerung, die an WT-Regelsetzung beteiligt ist (Bürgerräte, Abstimmungen etc.)      |
| `DEM_capture_risk`   | Risiko der Regelübernahme durch reiche/organisierte Gruppen (Proxy: Konzentration von WT+EUR)     |
| `DEM_feedback_lag`   | Zeit bis zur Regelanpassung nach erkannten Problemen (Care-Engpässe, Überlastungen, Ungleichheit) |

### 7.4 Resilienz / Gesundheit

| Name              | Beschreibung                                                                                  |
|-------------------|-----------------------------------------------------------------------------------------------|
| `burnout_risk`    | Anteil der Personen über kritischer Belastungsgrenze (Stunden, Zonenmix)                     |
| `buffer_WT`       | Durchschnittlicher WT-Puffer pro Person (Monate Grundversorgung ohne zusätzliche Arbeit)      |
| `shock_resilience`| Fähigkeit des Systems, auf externe Schocks umzuschichten, ohne Grundversorgung zu gefährden  |

---

## 8. Übersicht: Einstellbare „Schrauben“

Zur schnellen Orientierung, welche Parametertypen du in Varianten verändern kannst:

1. **Zonen-Parameter**  
   `g_i`, `q_i`, `WT_rate_i`, `H_max_i`, `H_min_i`, `priority_i`, `convert_*`, `cap_pop_i`.

2. **Zeitboden-Parameter**  
   `WT_floor`, `WT_floor_share_i`, `WT_floor_eligibility`, `WT_floor_index`.

3. **Persona-Parameter**  
   `H_total(p)`, `health_index(p)`, `care_need(p)`, `EUR_income(p)`, Präferenzen `pref_zone_i(p)` etc.

4. **Rotations- und Zugangsregeln**  
   `rotation_cycle_i`, `cooldown_i`, `access_rule_i(p)`, `quota_vulnerable_i`, `quota_rotation_i`.

5. **System-Caps / Anti-Spekulation**  
   `WT_cap_personal`, `WT_cap_zone_i`, `WT_cap_service_j`, `trade_cap_EUR_WT`, `WT_savings_window`.

6. **Charta-/Teil-V-Kontrollgrößen**  
   `ECO_*`, `GINI_*`, `DEM_*`, `burnout_risk`, `buffer_WT`, `shock_resilience` usw.
