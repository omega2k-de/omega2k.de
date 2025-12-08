---
id: '34'
parent: '30'
slug: 'lessons-example-parameters-2'
topic: 'lessons-learned'
route: '/content/lessons-learned/example-parameters-2'
title: 'Lessons learned: Beispiel-Parameter 2 - Akademische und technisch-kritische Berufe'
description: 'WT-System am Beispiel von Berufen, die typischerweise eine längere Ausbildung, ein Studium bzw. formale Abschlüsse erfordern.'
keywords: 'superorganismus, weighted time token, wt-zonen, stadt x, pflege, burnout, extrem-zone, zeitsouveränität, arbeitszeit, charta, simulationsmodell, lessons learned'
version: 1
createdAt: '2025-12-06T12:27:39.563Z'
author: 'Me & GPT'
---

# Beispiel-Parameter für verschiedene Bereiche (Teil 2)

Es sind nur Vorüberlegungen, um ein Muster erkennen zu können. Natürlich wird die finale Implementierung deutlich komplexer und eine
Granularität haben, die wir uns in unseren Träumen nicht vorstellen können. Deshalb fangen wir hier mal in keiner Sandbox an.

## Akademische und technisch-kritische Berufe im WT-System

In diesem Abschnitt geht es um Berufe, die typischerweise eine längere Ausbildung, ein Studium und/oder formale Abschlüsse erfordern –
insbesondere:

- **soziale akademische Berufe**: Lehrer:in, Dozent:in, Kinderbetreuung/Erzieher:in
- **technisch notwendige Berufe**: Strom, Wasser, Abwasser (Planung, Betrieb, Überwachung)

Ziel ist, sie im gleichen Koordinatensystem zu verorten wie zuvor (Gemeinwohlfaktor `g`, Qualifikations-/Risikofaktor `q`) und bei Bedarf um
weitere Dimensionen zu ergänzen.

---

## Dimensionen und Skalen (Erweiterung)

Wir behalten die beiden Kernachsen aus dem vorherigen Beispiel bei:

- **Gemeinwohlfaktor `g`** – Wie stark trägt eine Stunde Tätigkeit direkt zur Stabilität und Lebensfähigkeit des Systems bei?
- **Qualifikations-/Risikofaktor `q`** – Wie hoch sind Ausbildung, Verantwortung und Risiko (Fehlerfolgen, Belastung)?

Zusätzlich führen wir zwei **Hilfsdimensionen** ein, die für akademische/technische Berufe besonders aussagekräftig sind:

- **Zeitkritikalität `t`** – Wie schnell werden bei Ausfall der Tätigkeit ernsthafte Probleme sichtbar?
- **Substituierbarkeit / Automatisierbarkeit `s`** – Wie leicht kann diese Tätigkeit kurzfristig ersetzt oder automatisiert werden?

### Gemeinwohlfaktor `g` (ca. 1,0–3,0)

- `≈ 1,0`: eher neutrale Tätigkeiten, gesellschaftlich nützlich, aber nicht direkt systemkritisch.
- `1,5–2,0`: wichtige Basisversorgung (Bildung, Versorgung, Infrastruktur).
- `2,0–2,5`: stark gemeinwohlrelevant, systemkritisch.
- `> 2,5`: unmittelbar systemerhaltend, Ausfall führt sehr schnell zu gravierenden Schäden.

### Qualifikations-/Risikofaktor `q` (ca. 1,2–3,0)

- `≈ 1,2–1,6`: höhere Ausbildung oder Verantwortung, aber begrenzte Fehlerfolgen.
- `1,6–2,2`: Studium/hohe Spezialisierung, spürbare Verantwortung, Fehler können mittlere bis große Schäden erzeugen.
- `> 2,2`: sehr hohe Spezialisierung plus große Verantwortung, Fehler können systemische oder lebensgefährliche Konsequenzen haben.

### Zeitkritikalität `t` (Skala 1–3)

- `1`: Probleme entstehen eher langsam (Wochen bis Monate).
- `2`: Probleme werden mittelfristig spürbar (Tage bis Wochen).
- `3`: Probleme treten sehr schnell auf (Minuten bis Stunden).

### Substituierbarkeit / Automatisierbarkeit `s` (Skala 1–3)

- `1`: relativ leicht zu ersetzen oder teilweise zu automatisieren (viele potenzielle Ersatzkräfte, standardisierte Abläufe).
- `2`: begrenzt ersetzbar, mittlere Engpässe bei Ausfall.
- `3`: schwer ersetzbar (hohe Spezialisierung, komplexes implizites Wissen), Automatisierung nur begrenzt möglich.

---

## Zonen-Vorschlag für akademische und technisch-kritische Berufe

Wir definieren exemplarisch folgende Zonen:

1. `Z_BILDUNG_GRUND` – Grundbildung (Schule, Pflichtschulbereich)
2. `Z_BILDUNG_FORTGESCHRITTEN` – Hochschullehre, spezialisierte Weiterbildung
3. `Z_CARE_BILDUNG_FRUEH` – Frühkindliche Bildung, Kinderbetreuung
4. `Z_INFRA_STROM` – Stromversorgung (Erzeugung, Netzbetrieb, Leitstellen)
5. `Z_INFRA_WASSER` – Trinkwasserversorgung
6. `Z_INFRA_ABWASSER` – Abwasserentsorgung, Kläranlagen

Alle diese Zonen gehören zur **Basis- und Systemversorgung**, erhalten also hohe Priorität (`priority_i = 1` oder fein differenziert
`1a/1b`).

---

## Zonen: typische Parameterbereiche

Zur Orientierung legen wir pro Zone typische Bereiche für `g`, `q`, `t`, `s` fest (Heuristik, keine exakten Werte).

| Zone                      | Typische Tätigkeiten                                | g (Gemeinwohl) | q (Quali/Risiko) | t (Zeitkritik) | s (Substituierbarkeit) |
|---------------------------|-----------------------------------------------------|----------------|------------------|----------------|------------------------|
| Z_BILDUNG_GRUND           | Lehrer:innen allgemeinbildender Schulen             | 1,8 – 2,3      | 1,6 – 2,1        | 1 – 2          | 1 – 2                  |
| Z_BILDUNG_FORTGESCHRITTEN | Hochschuldozent:innen, spezialisierte Trainer       | 1,5 – 2,1      | 1,8 – 2,4        | 1              | 1 – 2                  |
| Z_CARE_BILDUNG_FRUEH      | Erzieher:innen, Kinderbetreuung                     | 2,0 – 2,5      | 1,6 – 2,1        | 2 – 3          | 1 – 2                  |
| Z_INFRA_STROM             | Netzingenieur:innen, Leitstellen, Kraftwerksführung | 2,3 – 2,9      | 2,0 – 2,7        | 3              | 2 – 3                  |
| Z_INFRA_WASSER            | Wasserwerksingenieur:innen, Betriebsführung         | 2,2 – 2,8      | 2,0 – 2,6        | 2 – 3          | 2 – 3                  |
| Z_INFRA_ABWASSER          | Abwasser-/Kläranlagenplanung und -betrieb           | 2,0 – 2,6      | 1,8 – 2,4        | 2              | 2 – 3                  |

- **Bildungszonen**: hohe Relevanz, aber Probleme entfalten sich eher mittelfristig (t = 1–2).
- **Technische Infrastrukturzonen**: sehr hohe Relevanz mit teils akuter Zeitkritikalität (Strom: t = 3).

---

## Berufsmapping: soziale vs. technische akademische Berufe

Wir mappen konkrete Berufe auf die Zonen und geben typische Wertebereiche an.

| Beruf                                      | Zone                      | g (Gemeinwohl) | q (Quali/Risiko) | t   | s   | Kurzbegründung                                                                           |
|--------------------------------------------|---------------------------|----------------|------------------|-----|-----|------------------------------------------------------------------------------------------|
| Lehrer:in (allgemeinbildende Schule)       | Z_BILDUNG_GRUND           | 1,9 – 2,3      | 1,6 – 2,0        | 1–2 | 1–2 | Grundbildung, demokratische Mündigkeit, lange Wirkungsketten, akademische Ausbildung.    |
| Dozent:in/Hochschullehre (MINT/Bildung)    | Z_BILDUNG_FORTGESCHRITTEN | 1,6 – 2,1      | 1,9 – 2,4        | 1   | 1–2 | Qualifizierte Fachkräfteversorgung, Forschungstransfer, starke Spezialisierung.          |
| Erzieher:in / Kinderbetreuung              | Z_CARE_BILDUNG_FRUEH      | 2,0 – 2,5      | 1,6 – 2,1        | 2–3 | 1–2 | Frühkindliche Entwicklung, Bindung, Schutz; unmittelbare Wirkung auf Entwicklungsbahnen. |
| Ingenieur:in Stromnetz/Leitstelle          | Z_INFRA_STROM             | 2,4 – 2,9      | 2,1 – 2,7        | 3   | 2–3 | Kritische Infrastruktur, Ausfälle führen schnell zu Blackouts mit Kaskadeneffekten.      |
| Ingenieur:in Wasserwerk                    | Z_INFRA_WASSER            | 2,3 – 2,8      | 2,0 – 2,6        | 2–3 | 2–3 | Trinkwassersicherheit, Hygiene, mittlere bis hohe Spezialisierung.                       |
| Fachkraft/Ingenieur:in Abwasser/Kläranlage | Z_INFRA_ABWASSER          | 2,0 – 2,6      | 1,8 – 2,4        | 2   | 2–3 | Schutz vor Umwelt- und Gesundheitsschäden, regulatorische Anforderungen, Prozesswissen.  |

---

## Kurzbegründungen im Detail

### Lehrer:in (allgemeinbildende Schule)

- **Zone:** `Z_BILDUNG_GRUND`
- **Gemeinwohl `g ≈ 1,9–2,3`**  
  Lehrer:innen sichern Grundbildung, Sprach- und Rechenkompetenzen, soziales Lernen und demokratische Mündigkeit. Die Auswirkungen sind
  langfristig, aber tiefgreifend: Bildung beeinflusst Gesundheitsverhalten, politische Stabilität, Innovationsfähigkeit und soziale
  Kohäsion.

- **Qualifikation/Risiko `q ≈ 1,6–2,0`**  
  Hochschulbildung, Referendariat, pädagogische und fachliche Kompetenzen. Fehler wirken meist nicht in einer einzelnen „Katastrophe“,
  sondern kumulativ (Bildungsarmut, geringe Chancengleichheit). Die Verantwortung ist hoch, aber die Zeitkritikalität moderat (`t = 1–2`).

- **Substituierbarkeit `s ≈ 1–2`**  
  Personell oft knapp, aber grundsätzlich ersetzbar; jedoch sind Beziehung, Erfahrung und pädagogisches Geschick nur begrenzt
  automatisierbar.

---

### Dozent:in / Hochschullehre (MINT/Bildung)

- **Zone:** `Z_BILDUNG_FORTGESCHRITTEN`
- **Gemeinwohl `g ≈ 1,6–2,1`**  
  Hochschullehre bildet Fachkräfte aus (z.B. für kritische Infrastruktur, Medizin, Verwaltung) und überträgt Forschungsergebnisse in die
  Praxis. Die Wirkung ist hoch, aber stärker auf zukünftige Systemfähigkeit fokussiert.

- **Qualifikation/Risiko `q ≈ 1,9–2,4`**  
  Meist Promotion oder vergleichbare Qualifikation, starke Spezialisierung, Forschungskompetenz. Falsche Inhalte können Qualitätsverluste
  verursachen, aber selten direkte akute Schäden.

- **Zeitkritikalität `t = 1`**  
  Ausfälle wirken eher langfristig: weniger oder schlechter ausgebildete Fachkräfte, geringere Innovationsrate.

---

### Erzieher:in / Kinderbetreuung

- **Zone:** `Z_CARE_BILDUNG_FRUEH`
- **Gemeinwohl `g ≈ 2,0–2,5`**  
  Frühkindliche Betreuung prägt Bindungsfähigkeit, emotionale Sicherheit und Lernbereitschaft. Vernachlässigung oder schlechte Betreuung
  können dauerhafte Schäden hinterlassen. Das macht diese Zone hochgemeinwohlrelevant.

- **Qualifikation/Risiko `q ≈ 1,6–2,1`**  
  Je nach System: Fachschule, Studium, Zusatzqualifikationen. Die Verantwortung ist hoch, da Kinder Schutz, Förderung und verlässliche
  Bezugspersonen benötigen.

- **Zeitkritikalität `t = 2–3`**  
  Fehlende Betreuung zeigt sehr schnell Folgen: Belastung der Eltern, Gefährdung von Kindern, Entwicklungsrisiken.

- **Substituierbarkeit `s = 1–2`**  
  Platzangebote sind knapp, gute Betreuung ist nur begrenzt skalierbar. Automatisierung ist faktisch nicht sinnvoll.

---

### Ingenieur:in Stromnetz / Leitstelle

- **Zone:** `Z_INFRA_STROM`
- **Gemeinwohl `g ≈ 2,4–2,9`**  
  Stromversorgung ist für nahezu alle anderen Zonen Grundlage: Medizin, Kommunikation, Wasser, Verkehr, Lebensmittelketten, IT. Ein längerer
  Stromausfall führt schnell zu systemweiten Ausfällen.

- **Qualifikation/Risiko `q ≈ 2,1–2,7`**  
  Studium, oft Spezialisierungen in Energie-/Elektrotechnik, Netzschutz, Regelungstechnik. Fehler können zu Netzausfällen, Geräteschäden,
  Sicherheitsrisiken und großflächigen Blackouts führen.

- **Zeitkritikalität `t = 3`**  
  Probleme treten in Minuten bis Stunden auf. Es handelt sich um eine der zeitkritischsten Infrastrukturen des Systems.

- **Substituierbarkeit `s = 2–3`**  
  Hohe Spezialisierung, viele Systeme sind historisch gewachsen und komplex. Einarbeitung dauert, spontan ersetzbar ist schwierig.

---

### Ingenieur:in Wasserwerk

- **Zone:** `Z_INFRA_WASSER`
- **Gemeinwohl `g ≈ 2,3–2,8`**  
  Sichere Wasserversorgung ist unverzichtbar für Gesundheit, Hygiene, Ernährung. Ausfälle oder Verunreinigungen führen schnell zu
  Erkrankungen und Versorgungsproblemen.

- **Qualifikation/Risiko `q ≈ 2,0–2,6`**  
  Ingenieurwesen (Versorgungstechnik, Umwelttechnik) plus regulatorisches Wissen und Prozesskompetenz. Fehlentscheidungen können Trinkwasser
  verunreinigen oder die Versorgung gefährden.

- **Zeitkritikalität `t = 2–3`**  
  Ausfälle wirken schnell: wenige Stunden bis Tage ohne sauberes Wasser erzeugen schwere Probleme.

- **Substituierbarkeit `s = 2–3`**  
  Anlagen sind hochspezifisch, Ersatzpersonal ist begrenzt vorhanden.

---

### Fachkraft/Ingenieur:in Abwasser / Kläranlage

- **Zone:** `Z_INFRA_ABWASSER`
- **Gemeinwohl `g ≈ 2,0–2,6`**  
  Abwasserbehandlung schützt vor Umweltverschmutzung, Grundwasserschäden und Seuchengefahr. Die Bedeutung ist groß, wird aber oft erst
  sichtbar, wenn etwas schief geht.

- **Qualifikation/Risiko `q ≈ 1,8–2,4`**  
  Mischung aus technischer Ausbildung, Ingenieurwesen und praktischem Prozesswissen. Falsche Steuerung oder Wartung kann zu Einleitungen von
  Schadstoffen, Überläufen oder Havarien führen.

- **Zeitkritikalität `t = 2`**  
  Probleme wachsen über Stunden bis Tage an, können dann aber massiv sein (z.B. Flussvergiftung, lokale Vorsorgekrisen).

---

## Muster: soziale vs. technische akademische Berufe

Im g–q–t–s-Raum entstehen einige klare Muster:

- **Soziale akademische Berufe (Lehrer, Dozent:innen, Erzieher:innen)**
  - `g`: hoch, v.a. bei frühkindlicher Bildung und Grundschule (2,0–2,5).
  - `q`: mittelhoch bis hoch (1,6–2,4).
  - `t`: eher 1–2 (Auswirkungen werden verzögert sichtbar, aber sind tiefgreifend).
  - `s`: 1–2 (nicht beliebig ersetzbar, aber tendenziell leichter als hochspezialisierte Technik).

- **Technisch notwendige Berufe (Strom, Wasser, Abwasser)**
  - `g`: sehr hoch (2,2–2,9), direkt systemstützend.
  - `q`: hoch (2,0–2,7), Fehler mit potenziell großen Schäden.
  - `t`: 2–3 (Probleme treten schnell bis sehr schnell auf).
  - `s`: 2–3 (Spezialisierung, komplexe Technik, wenig Ersatz).

Im [proto-Superorganismus](/content/superorganism-2-0#content) ist das relevant, weil:

- soziale akademische Berufe **den langfristigen „Zustand des Gewebes“** bestimmen (Bildung, Sozialkapital, demokratische Kompetenz),
- technisch notwendige Berufe dagegen **die akute „Funktionsfähigkeit der Organe“** sichern (Energie, Wasser, Entsorgung).

---

## Folgerungen für Zonenwahl und WT-Skalen

### 1. Priorität und WT-Faktoren

- Alle genannten Berufe sollten in **Basis- bzw. Systemzonen** mit hoher Priorität liegen (`priority_i = 1`).
- Innerhalb dieser Priorität kannst du feiner differenzieren:
  - `Z_BILDUNG_*` mit hohen g-Werten, aber geringerer Zeitkritik.
  - `Z_INFRA_*` mit sehr hohen g- und hohen t-Werten.

WT-Faktoren könnten z.B. so gestaltet werden:

- `WT_rate_i = g_i * q_i`, ergänzt um Aufschläge für hohe `t` und geringe `s` (kaum ersetzbar, sehr zeitkritisch).

### 2. Langfristige vs. kurzfristige Wirkung

- Bildungs- und Frühbetreuungszonen sollten ein **besonderes Gewicht** erhalten, obwohl ihre Probleme zeitverzögert sichtbar werden (`t`
  kleiner).
- Das Modell sollte ausdrücklich verhindern, dass kurzfristig sichtbare Sektoren (z.B. Strom) alles dominieren, während Bildung „unsichtbar
  verhungert“.

### 3. Nutzung von `t` und `s` als Steuergrößen

- **Zeitkritikalität `t`** kann in der Planung und im Monitoring genutzt werden:
  - Hohe `t` → stärkere Resilienzanforderungen, Redundanzen, Notfallpläne.
- **Substituierbarkeit `s`** hilft, Engpässe zu erkennen:
  - Hohe `s`-Werte (schwer ersetzbar) → zusätzlicher Anreiz in Ausbildung, bessere Arbeitsbedingungen, gezielte Förderung.

### 4. Vergleich mit nicht-akademischen Basisberufen

- Du kannst im gleichen Koordinatensystem nun:
  - Müllabfuhr, Busverkehr, Kassentätigkeit (vorheriges Beispiel)
  - und akademische/technische Berufe (dieses Beispiel)

  direkt vergleichen und sehen:
  - Wo ist `g` ähnlich hoch, aber `q` verschieden?
  - Wo sind Berufe gesellschaftlich unterbewertet, obwohl `g` und `t` hoch sind?

Damit wird das WT-System zu einem Instrument, um nicht nur „akademisch vs. nicht akademisch“ zu sehen, sondern **systemische Bedeutung,
Qualifikation, Risiko, Zeitkritik und Substituierbarkeit** in einem konsistenten Rahmen abzubilden.
