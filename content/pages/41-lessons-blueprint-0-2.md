---
id: '41'
parent: '30'
slug: 'lessons-blueprint-0-2'
topic: 'lessons-learned'
route: '/content/lessons-learned/blueprint-0-2'
title: 'Lessons learned: Strukturvariablen, Zonenstruktur und Grundsicherung im Modell 0.2'
description: 'Parameter-Blaupause für das proto-Superorganismus 2.0 / WT-System 0.2. Ein zweiter Versuch, Größen zuzuordnen und konkret durchzuspielen.'
keywords: 'Parameter blueprint Superorganismus System WT Token Weighted Strukturvariablen Zonenstruktur'
version: 1
createdAt: '2025-12-05T20:48:12.791Z'
author: 'Me & GPT'
---

# Parameter-Blaupause: proto-Superorganismus 2.0 / WT-System 0.2

## Globale Strukturvariablen

| Name            | Beschreibung                                                                 | Typ / Einheit         |
|-----------------|------------------------------------------------------------------------------|------------------------|
| `N`             | Anzahl der Einwohner:innen im betrachteten System (z.B. Kommune, Region)    | Integer                |
| `P`             | Betrachtungsperiode (Standard: 1 Monat)                                     | Zeitintervall          |
| `H_max_total`   | Max. Arbeitsstunden pro Person und Monat (alle Zonen zusammen)              | Stunden / Monat        |
| `H_min_regen`   | Mindest-Regenerationszeit (Nicht-Arbeitszeit) pro Person und Monat          | Stunden / Monat        |
| `WT`            | Einheit „Weighted Time Token“ (gewichtete Arbeitsstunde)                    | Zeiteinheit mit Faktor |
| `seed_version`  | Version des Modell-Seed-Datensatzes (z.B. 12 Zonen, 50 Cluster)              | String / SemVer        |
| `algo_version`  | Version der Berechnungslogik (Parameter-Funktion), damit Runs reproduzierbar sind | String / SemVer   |
| `run_id`        | Eindeutige ID einer Simulations-/Kalibrierungsrunde (Parameter + Annahmen + Ergebnisse) | String (UUID) |
| `D`             | Abhängigkeitsmatrix zwischen Zonen (Kaskaden: Ausfall in Zone A senkt Kapazität in Zone B) | Matrix (k×k) |

**Präzisierung (H_max_total / H_min_regen):**  
Diese beiden Größen sind nicht „frei wählbar“, sondern sollten durch empirische Zeitbudgets plausibilisiert werden (Erwerbsarbeit, unbezahlte Arbeit/Care, Schlaf, Wegezeiten). Destatis liefert dafür einen belastbaren Rahmen über die Zeitverwendungserhebung (ZVE 2022; revidierte Ergebnisse). In der Simulation ist das keine „Steuergröße“, sondern eine Realismus-Constraint: Der Modellraum darf keine physisch/sozial unmöglichen Zeitbilanzen zulassen.

---

## Zonenstruktur (WT-Zonen)

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
| `t_i`            | Zeitkritikalität (wie schnell entsteht Schaden/Unterversorgung bei Ausfall; „Stunden vs. Wochen“)     | Skala (1..3)                   |
| `s_i`            | Substituierbarkeit (wie schnell kann Kapazität in der Zone ersetzt werden; „Pool/Engpass“)            | Skala (1..3)                   |
| `kritis_tag_i`   | Marker, ob Zone i (voll/teilweise) einem KRITIS-Sektor zugeordnet ist (Anker für g/t)                 | Bool / Kategorie               |

**Präzisierung (g_i, q_i als Anker; t_i, s_i als notwendige Ergänzung):**
- `g_i` und `t_i` sollten nach Möglichkeit an objektive Systemrelevanz geknüpft werden. Ein praktikabler externer Anker ist die KRITIS-Sektorlogik (BSI), weil sie genau die Bereiche beschreibt, deren Ausfall „nachhaltig wirkende Versorgungsengpässe“ bzw. erhebliche Störungen auslöst.
- `q_i` sollte nicht „Status“ messen, sondern Tätigkeitskomplexität/Verantwortung/Risiko. Als späterer Datenanker eignet sich das Anforderungsniveau im Berufssystem (BA/KldB-Umfeld).
- `s_i` ist der zentrale Goodhart-Schutz: Wenn eine Tätigkeit nicht kurzfristig substituierbar ist (Engpass, lange Einarbeitung, geringe Poolgröße), muss das Modell das sichtbar machen, ohne nur „mehr Geld“ zu vergeben. Als Proxy kann die Engpassanalyse (BA) verwendet werden, die methodisch explizite Engpassindikatoren nutzt.

**Präzisierung (WT_rate_i):**  
Die Formel `WT_rate_i = 1h * g_i * q_i` bleibt als verständliche Baseline bestehen. In realistischeren Varianten wird `WT_rate_i` jedoch durch zusätzliche, explizite Modulatoren ergänzt (z.B. `t_i`, `s_i`, Schicht-/Gefahrfaktoren). Das ist nicht „mehr Komplexität um der Komplexität willen“, sondern nötig, um (a) Kaskaden zu dämpfen, (b) Engpässe nicht zu verschleiern und (c) Burnout-Mechaniken systemisch abzufangen.

---

## Zeitboden / Grundsicherung in WT

Der „Zeitboden“ ist eine pro Kopf garantierte WT-Grundausstattung
bzw. ein Mindestanspruch an gemeinwohlorientierten Leistungen.

| Name                 | Beschreibung                                                                                          | Typ / Einheit |
|----------------------|-------------------------------------------------------------------------------------------------------|---------------|
| `WT_floor`           | Garantierter WT-Anspruch pro Person und Monat (z.B. für Wohnen, Grundversorgung)                     | WT / Monat    |
| `WT_floor_share_i`   | Anteil des Zeitbodens, der nur für bestimmte Zonen/Leistungen genutzt werden darf                    | Anteil 0–1    |
| `WT_floor_eligibility(p)` | Regel, wer welchen Zeitboden erhält (alle, Kinder, Erwerbslose, Pflegebedürftige, etc.)         | Funktion      |
| `WT_floor_index`     | Indexierungsregel des Zeitbodens (z.B. Kopplung an Lebenshaltungskosten, Mieten, Gesundheitskosten)  | Regel         |
| `WT_floor_bundle`    | Definierter Waren-/Leistungsbundle, den der Zeitboden mindestens absichern soll (damit WT_floor nicht „leer“ wird) | Struktur |

**Präzisierung:**  
Der Zeitboden ist im Modell nicht „bedingungsloses Extra“, sondern die formale Abbildung eines Mindest-Leistungsniveaus. Damit er testbar ist, braucht er eine explizite Bundle-Definition (welche Leistungen), sonst ist `WT_floor` nur eine Zahl ohne Operationalisierung. In Simulationen wird der Zeitboden typischerweise gegen `deprivation_rate` und `buffer_WT` geprüft (Abschnitt 7).

---

## Individuelle Variablen / Personas

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
| `skill_profile(p)` | Qualifikations-/Skill-Profil, das Zugang zu Zonen/Jobs steuert (Skill-Tree-Anschluss)               | Struktur       |

### Präferenzstruktur pro Persona

| Name              | Beschreibung                                                              |
|-------------------|---------------------------------------------------------------------------|
| `pref_zone_i(p)`  | Präferenz der Persona für Tätigkeiten in Zone i (hoch/mittel/niedrig)    |
| `pref_risk(p)`    | Bereitschaft, riskantere/höher gewichtete Tätigkeiten zu übernehmen      |
| `pref_stability(p)` | Präferenz für stabile vs. volatile WT-Einkommen                         |

**Präzisierung:**  
`H_total(p)` ist eine harte Budget-Constraint, keine „Belohnungsvariable“. In realistischen Varianten wird es durch (a) Care-Last, (b) Gesundheitsgrenzen und (c) Wegezeiten begrenzt. Das ist zentral, um versteckte Unfairness (z.B. systematisch höhere unbezahlte Care-Zeit) im Modell nicht zu ignorieren.

---

## Rotations- und Verteilungsregeln

Regeln, damit das System nicht „klebt“ (kein dauerhaftes Festhängen in ungesunden Zonen).

| Name / Regel        | Beschreibung                                                                                   |
|---------------------|------------------------------------------------------------------------------------------------|
| `rotation_cycle_i`  | Maximale Dauer, die eine Person zusammenhängend in belastender Zone i tätig sein darf         |
| `cooldown_i`        | Mindestpause zwischen zwei Einsätzen in Zone i                                                 |
| `access_rule_i(p)`  | Kriterien für Zugang zu Zone i (Qualifikation, Gesundheit, demokratische Zuteilung, Los)      |
| `quota_vulnerable_i`| Mindestquote geschützter Gruppen, die **nicht** in belastende Zonen gelangen dürfen           |
| `quota_rotation_i`  | Zielanteil von Personen, die Rotationsangebote tatsächlich nutzen bzw. Cap auf Dauerbesetzung |
| `lifetime_cap_i`    | Lebenszeit-Cap in besonders belastenden/gefährlichen Zonen (Schutz vor Extrem-Dauerkarrieren) |

**Präzisierung:**  
Rotation ist nicht nur „Fairness“, sondern ein Stabilitätsinstrument gegen Ausfallkaskaden: Wenn eine Zone mit hohem `t_i`/`s_i` ausbrennt, sinkt ihre Kapazität und reißt abhängige Zonen mit. Deshalb gehört Rotation in die Kernlogik (nicht als „Option“).

---

## Caps und Systembegrenzungen

Begrenzungen zur Einhegung von Spekulation und Überlastung.

| Name                | Beschreibung                                                                                         | Typ / Einheit |
|---------------------|------------------------------------------------------------------------------------------------------|---------------|
| `WT_cap_personal`   | Maximaler WT-Bestand pro Person (oberhalb ggf. Abschmelzung/Umlaufimpuls)                           | WT            |
| `WT_savings_window` | Zeitraum, über den WT unverändert gehalten werden dürfen, bevor Abschmelzlogik greift               | Monate        |
| `WT_cap_zone_i`     | Max. Summe an WT, die in Zone i im Umlauf sein darf (z.B. Begrenzung Luxus-Zone)                    | WT / Monat    |
| `WT_cap_service_j`  | Cap pro Leistungstyp (z.B. max. WT-Anteil an Wohnkosten, um Verdrängungseffekte zu vermeiden)       | WT / Monat    |
| `trade_cap_EUR_WT`  | Globales Limit für systemweite Konvertierungen EUR↔WT pro Periode                                   | WT / Monat    |
| `override_policy`   | Governance-Regel: wann und wie Parameter (g/q/t/s) überschrieben werden dürfen (append-only mit Begründung) | Regel |

**Präzisierung:**  
`override_policy` ist die formale Antwort auf Goodhart: Proxys sind nie perfekt. Das Modell muss Korrekturen zulassen, aber nur auditierbar (wer/warum/wann), damit die Regelsetzung nicht unbemerkt „captured“ wird.

---

## Charta- und Teil-V-Zieldimensionen (Prüfvariablen)

Diese Größen werden verwendet, um jede Parameter-Variante gegen die Charta
und das Teil-V-Prüfschema zu testen.

### Ökologische Integrität

| Name                 | Beschreibung                                                               |
|----------------------|----------------------------------------------------------------------------|
| `ECO_footprint_total`| Gesamtressourcen-/Emissionsfußabdruck pro 1000 Einwohner:innen            |
| `ECO_cap`            | Zulässiger Höchstwert (kompatibel mit planetaren Grenzen)                 |
| `ECO_zone_i`         | Ökologische Last pro Stunde in Zone i (Energie, Fläche, Emissionen etc.)  |

### Soziale Gerechtigkeit

| Name               | Beschreibung                                                                                   |
|--------------------|------------------------------------------------------------------------------------------------|
| `GINI_WT`          | Ungleichheitsmaß über WT-Einkommen/Bestände                                                   |
| `GINI_EUR`         | Ungleichheitsmaß über EUR-Einkommen/Bestände                                                 |
| `deprivation_rate` | Anteil der Personen, die Grundbedürfnisse trotz Zeitboden + WT nicht decken können           |
| `care_gap`         | Differenz zwischen benötigter und tatsächlich geleisteter/vergüteter Care-Arbeit             |

### Demokratie / Mitbestimmung

| Name                 | Beschreibung                                                                                       |
|----------------------|----------------------------------------------------------------------------------------------------|
| `DEM_participation`  | Anteil der Bevölkerung, die an WT-Regelsetzung beteiligt ist (Bürgerräte, Abstimmungen etc.)      |
| `DEM_capture_risk`   | Risiko der Regelübernahme durch reiche/organisierte Gruppen (Proxy: Konzentration von WT+EUR)     |
| `DEM_feedback_lag`   | Zeit bis zur Regelanpassung nach erkannten Problemen (Care-Engpässe, Überlastungen, Ungleichheit) |
| `override_rate`      | Anteil/Zahl der Parameter-Overrides pro Run (Indikator für Proxy-Qualität und Governance-Stress)  |

### Resilienz / Gesundheit

| Name              | Beschreibung                                                                                  |
|-------------------|-----------------------------------------------------------------------------------------------|
| `burnout_risk`    | Anteil der Personen über kritischer Belastungsgrenze (Stunden, Zonenmix)                     |
| `buffer_WT`       | Durchschnittlicher WT-Puffer pro Person (Monate Grundversorgung ohne zusätzliche Arbeit)      |
| `shock_resilience`| Fähigkeit des Systems, auf externe Schocks umzuschichten, ohne Grundversorgung zu gefährden  |
| `service_level_i` | Versorgungsgrad je Zone (Output-Metrik: Anteil der benötigten Leistungen/Arbeitsstunden, die erfüllt werden) |
| `cascade_loss`    | Verlust durch Kaskaden (wie stark Ausfall in Zone A andere Zonen „mitreißt“)                 |

**Präzisierung (Service-Level als harte Wahrheitsschicht):**  
Die Parameter (g/q/t/s, Caps, Rotation) sind Mittel zum Zweck. Entscheidend ist, ob das System die Basisversorgung stabil hält (`service_level_i`) und gleichzeitig keine strukturelle Unfairness erzeugt (`GINI_*`, `deprivation_rate`, `care_gap`). Deshalb sollten alle Varianten gegen Stress-Szenarien geprüft werden (Pandemie/Krankenstand, Energieengpass, Cyberincident, Logistikstörung, Gaming/Manipulation).

---

## Übersicht: Einstellbare „Schrauben“

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

7. **Daten- und Audit-Schrauben (Reproduzierbarkeit / Goodhart-Schutz)**  
   `seed_version`, `algo_version`, `run_id`, `override_policy`, `override_rate`, sowie Logging der Quellen/Proxys pro Run.

---

## Quellenanker für spätere Kalibrierung (nicht normativ, sondern als Daten-/Struktur-Backbone)

- Destatis – Zeitverwendung (ZVE 2022, revidierte Ergebnisse / Themenseite):  
  https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Einkommen-Konsum-Lebensbedingungen/Zeitverwendung/_inhalt.html

- Destatis – Ergebnisse ZVE 2022 („Wo bleibt die Zeit?“) inkl. Hinweis auf revidierte Ergebnisse (06.06.2025):  
  https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Einkommen-Konsum-Lebensbedingungen/Zeitverwendung/Ergebnisse/_inhalt.html

- Destatis – Pressemitteilung zur Korrektur/Revisionshinweis ZVE 2022 (28.03.2024; Hinweis auf revidierte Ergebnisse ab 06.06.2025):  
  https://www.destatis.de/DE/Presse/Pressemitteilungen/2024/03/PD24_131_63991.html

- Bundesagentur für Arbeit – Fachkräfteengpassanalyse (Presseinfo: 163 Engpassberufe in 2024):  
  https://www.arbeitsagentur.de/presse/2025-25-qualifizierte-fachkraefte-weiterhin-gesucht

- BSI – Allgemeine Infos zu KRITIS inkl. Sektoren (Struktur-Anker für Zonen & Kaskadenrelevanz):  
  https://www.bsi.bund.de/DE/Themen/Regulierte-Wirtschaft/Kritische-Infrastrukturen/Allgemeine-Infos-zu-KRITIS/allgemeine-infos-zu-kritis_node.html
