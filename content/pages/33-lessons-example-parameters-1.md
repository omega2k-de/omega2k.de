---
id: '33'
parent: '30'
slug: 'lessons-example-parameters-1'
topic: 'lessons-learned'
route: '/content/lessons-learned/example-parameters-1'
title: 'Lessons learned: Beispiel-Parameter 1 - Grundversorgung'
ogTitle: 'Lessons learned: Beispiel-Parameter 1 - Grundversorgung'
ogImage: '/cdn/images/manual/lessons-example-parameters-1_1200x800.webp'
ogImageWidth: '1200'
ogImageHeight: '800'
description: 'WT-System gewichtet Arbeitszeit nach Gemeinwohl, Qualifikation und Belastung, sichert Grundversorgung und wird demokratisch gesteuert.'
keywords: 'superorganismus, weighted time token, wt-zonen, stadt x, pflege, burnout, extrem-zone, zeitsouveränität, arbeitszeit, charta, simulationsmodell, lessons learned'
version: 2
createdAt: '2025-12-06T12:12:31.231Z'
author: 'Me & GPT'
---

# Beispiel-Parameter für verschiedene Bereiche (Teil 1)

Es sind nur Vorüberlegungen, um ein Muster erkennen zu können. Natürlich wird die finale Implementierung deutlich komplexer und eine
Granularität haben, die wir uns in unseren Träumen nicht vorstellen können. Deshalb fangen wir hier mal in keiner Sandbox an.

## Skalen festlegen (Arbeits-Hypothese)

Um konkrete Berufe in deinem WT-System verorten zu können, brauchen wir zunächst ein gemeinsames Koordinatensystem. Die beiden zentrale
Achsen sind:

- der **Gemeinwohlfaktor `g`**: Wie stark trägt eine Stunde Tätigkeit direkt zur Stabilität und Lebensfähigkeit des Systems bei?
- der **Qualifikations-/Risikofaktor `q`**: Wie hoch sind Ausbildung, Verantwortung und Risiko (Fehlerfolgen, physische/psychische
  Belastung)?

Diese Skalen sind bewusst als **Arbeits-Hypothese** formuliert. Sie sollen es erleichtern, Muster zu erkennen und später zu justieren –
nicht „absolute Wahrheiten“ liefern.

### Gemeinwohlfaktor `g` (ca. 0,5–3,0)

- `≈ 1,0`: „neutrale“ Tätigkeit, nützlich, aber nicht direkt systemkritisch.
- `1,5–2,0`: wichtige Basisversorgung mit klarer Relevanz für das tägliche Funktionieren.
- `2,0–2,5`: stark gemeinwohlrelevant, systemkritisch – wenn diese Tätigkeiten ausfallen, entstehen schnell ernste Probleme.
- `> 2,5`: unmittelbar lebens- oder systemerhaltend auf hohem Niveau (z.B. Notfallmedizin, kritische Infrastrukturleitstellen).
- `< 1,0`: eher „nice to have“, überwiegend Luxus/Prestige oder bei Übernutzung sogar potenziell schädlich.

Der Gemeinwohlfaktor drückt aus, wie sehr eine Tätigkeit dem „Gesamtorganismus“ hilft, gesund und funktionsfähig zu bleiben.

### Qualifikations-/Risikofaktor `q` (ca. 0,8–3,0)

- `≈ 1,0`: kurze bis mittlere Ausbildung, überschaubare Verantwortung, normales Risiko.
- `1,2–1,6`: erhöhte physische oder psychische Belastung oder klar höhere Verantwortung.
- `1,6–2,2`: lange Ausbildung und/oder hohe Verantwortung, komplexe Entscheidungen, Fehlerfolgen können ernst sein.
- `> 2,2`: sehr hohe Spezialisierung plus große Verantwortung und potenziell kritische Folgen von Fehlern.

Der Qualifikations-/Risikofaktor ist damit eine Kombination aus „Wie viel musst du können?“ und „Wie schlimm ist es, wenn du Fehler
machst?“ – inklusive Belastungsdimension.

---

## Zonen-Vorschlag für diese Beispiele

Für die Betrachtung von fünf exemplarischen Berufen bietet sich eine grobe Einteilung in Basisversorgungs-Zonen an. Alle ausgewählten
Tätigkeiten sind für das Funktionieren der Gesellschaft sehr wichtig und liegen klar **nicht** im Luxusbereich.

Wir ordnen sie in folgende Zonen ein:

1. `Z_BASIS_INFRA_ABFALL` – Abfallentsorgung / Stadtreinigung  
   → Müllmann/-frau

2. `Z_BASIS_MOBILITAET` – Öffentlicher Personennahverkehr  
   → Busfahrer:in

3. `Z_GESUNDHEIT_PRIMAER` – Primäre Gesundheitsversorgung  
   → Allgemeinmediziner:in / Hausärzt:in

4. `Z_GESUNDHEIT_DISTRIBUTION` – Verteilung und Beratung im Gesundheitswesen  
   → Apotheker:in

5. `Z_DISTRIBUTION_LEBENSMITTEL` – Lebensmitteldistribution / Einzelhandel  
   → Kassierer:in im Lebensmittelhandel

In deinem WT-System würden diese Zonen typischerweise eine **hohe Priorität** (`priority_i = 1` oder 2) erhalten, da sie unmittelbar zur
stabilen Versorgung des „proto-Superorganismus“ beitragen.

---

## Berufsmapping: g-/q-Bereiche

Ausgehend von den oben definierten Skalen lassen sich für die fünf Beispielberufe typische Bereiche für `g` und `q` angeben. Es geht dabei
um **Bandbreiten**, nicht um einzelne Punktwerte – damit bleibt die Modellierung flexibel.

| Beruf                       | Zone                      | g-Bereich (Gemeinwohl) | q-Bereich (Quali/Risiko) | Kurzbegründung                                                                                                                                              |
|-----------------------------|---------------------------|------------------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Müllmann/-frau              | BASIS_INFRA_ABFALL        | 1,8 – 2,3              | 1,2 – 1,6                | Systemkritische Hygiene & Infrastruktur, hohe körperliche Belastung, mäßige formale Qualifikation, aber gefährliche Arbeitsumgebung.                        |
| Busfahrer:in                | BASIS_MOBILITAET          | 1,8 – 2,2              | 1,4 – 1,8                | ÖPNV trägt Verkehrssicherheit & Grundmobilität, hohe Verantwortung für Menschenleben, Stress und Schichtarbeit.                                             |
| Allgemeinmediziner:in       | GESUNDHEIT_PRIMAER        | 2,2 – 2,8              | 2,0 – 2,6                | Primärversorgung der Gesundheit, lange Ausbildung, komplexe Diagnostik, direkte Gesundheitsfolgen bei Fehlern.                                              |
| Apotheker:in                | GESUNDHEIT_DISTRIBUTION   | 1,8 – 2,3              | 1,8 – 2,3                | Schnittstelle zwischen Verordnung und Patient:innen, Arzneimittelsicherheit, Beratung, hohe Fehlerrisiken.                                                  |
| Kassierer:in (Lebensmittel) | DISTRIBUTION_LEBENSMITTEL | 1,3 – 1,8              | 1,0 – 1,3                | Sicherung des Zugangs zu Lebensmitteln, aber Teile der Tätigkeit sind stark routinisiert/automatisierbar, hohe Taktung, eher geringe formale Qualifikation. |

Diese Tabelle liefert eine erste, strukturierte Einordnung. In einem nächsten Schritt können diese Werte direkt in WT-Zonenparameter (z.B.
`WT_rate_i = g_i * q_i`) übersetzt werden.

---

## Kurzbegründungen im Detail

Die folgenden Abschnitte erläutern, warum die jeweiligen g- und q-Bereiche plausibel sind. Ziel ist, das implizite „Bauchgefühl“ über
Systemrelevanz explizit und modellierbar zu machen.

### Müllmann/-frau (Abfallentsorgung)

- **Zone:** `Z_BASIS_INFRA_ABFALL`, hohe Priorität (Basisversorgung)
- **Gemeinwohl `g ≈ 1,8–2,3`**  
  Ohne verlässliche Abfallentsorgung entstehen sehr schnell gesundheitliche Risiken: Schädlingsbefall, Gestank, Kontamination und
  Seuchengefahr. Zusätzlich leidet die Lebensqualität massiv. Die Tätigkeit ist damit klar über „neutralen“ Dienstleistungen anzusiedeln und
  liegt nahe am systemkritischen Bereich.

- **Qualifikation/Risiko `q ≈ 1,2–1,6`**  
  Die formale Ausbildung ist meist kürzer als bei akademischen Berufen, die Arbeit erfordert aber viel praktisches Know-how,
  Sicherheitsroutinen und Risikobewusstsein. Es gibt physische Gefahren (Straßenverkehr, Hebesysteme, Schnittverletzungen, Kontakt mit
  Problemstoffen) und hohe körperliche Belastung.

**Muster:** Hoher Gemeinwohlfaktor bei mittlerem Qualifikations-/Risikofaktor, stark körperlich belastend. Real meist unterbewertet, im
WT-System klar als hochrelevant sichtbar.

---

### Busfahrer:in (Öffentlicher Verkehr)

- **Zone:** `Z_BASIS_MOBILITAET`, hohe Priorität
- **Gemeinwohl `g ≈ 1,8–2,2`**  
  Der ÖPNV sichert Grundmobilität: Zugang zu Arbeit, Bildung, Gesundheit, Kultur. Gerade in Städten reduziert er Individualverkehr,
  Emissionen und Flächenverbrauch. Fällt diese Funktion aus, bricht für viele Menschen die alltägliche Teilhabe weg.

- **Qualifikation/Risiko `q ≈ 1,4–1,8`**  
  Neben dem Erwerb spezieller Führerscheinklassen sind Sicherheits- und Servicekompetenzen wichtig. Busfahrer:innen tragen die Verantwortung
  für viele Menschen gleichzeitig, sind im Straßenverkehr permanent hochkonzentriert und oft Schicht- und Nachtarbeit ausgesetzt. Fehler
  können direkte und schwere Folgen haben.

**Muster:** Gemeinwohl ähnlich Müllabfuhr, aber mit höherer Verantwortung bei etwas geringerer körperlicher Belastung. Hohe
Systemkritikalität bei mittlerem bis höherem q.

---

### Allgemeinmediziner:in (Hausarzt/-ärztin)

- **Zone:** `Z_GESUNDHEIT_PRIMAER`, höchste Priorität
- **Gemeinwohl `g ≈ 2,2–2,8`**  
  Hausärzt:innen sind zentrale Knoten im Gesundheitssystem: Erstdiagnose, Langzeitbegleitung, Triage, Prävention. In vielen Regionen sind
  sie der erste und oft einzige niederschwellige Zugang zum Gesundheitssystem. Ausfälle führen schnell zu Unterversorgung, Fehl- oder
  Spätbehandlungen.

- **Qualifikation/Risiko `q ≈ 2,0–2,6`**  
  Studium, Facharztausbildung und kontinuierliche Fortbildung sind Voraussetzung. Diagnostische Entscheidungen sind häufig unter
  Unsicherheit zu treffen, Fehler können schwerwiegende Folgen bis hin zu Todesfällen haben. Die Verantwortung ist entsprechend hoch, ebenso
  die mentale Belastung.

**Muster:** Klarer Kandidat für den oberen Bereich sowohl bei g- als auch bei q-Skalen – „oben rechts“ im g–q-Diagramm deines Systems.

---

### Apotheker:in

- **Zone:** `Z_GESUNDHEIT_DISTRIBUTION`, hohe Priorität (Basisversorgung, teils Schnittstelle zu Marktlogik)
- **Gemeinwohl `g ≈ 1,8–2,3`**  
  Apotheken sichern den Zugang zu Medikamenten, prüfen Wechselwirkungen, beraten zu Dosierung und Anwendung und fungieren oft als
  niedrigschwellige Gesundheitsberatung. In unterversorgten Gebieten sind sie besonders wichtig. Gleichzeitig gibt es auch Anteile, die eher
  Handelscharakter haben (Kosmetik, Nicht-Arznei-Produkte), weshalb der g-Bereich etwas breiter ist.

- **Qualifikation/Risiko `q ≈ 1,8–2,3`**  
  Ein Pharmazie-Studium und Approbation sind notwendig, hinzu kommen rechtliche und fachliche Anforderungen. Falsche Abgabe, Dosierung oder
  unzureichende Beratung können zu schweren Gesundheitsschäden führen. Damit ist das Risiko deutlich über durchschnittlichen
  Dienstleistungsjobs angesiedelt.

**Muster:** Qualifikationsniveau ähnlich (manchen) ärztlichen Tätigkeiten, Gemeinwohlwert etwas niedriger, weil stärker distributions- als
diagnoseorientiert. Im g–q-Raum typischerweise im oberen Mittelfeld.

---

### Kassierer:in (Lebensmittelhandel)

- **Zone:** `Z_DISTRIBUTION_LEBENSMITTEL`, mittlere bis hohe Priorität (Basisversorgung, aber potenziell automatisierbar)
- **Gemeinwohl `g ≈ 1,3–1,8`**  
  Kassierer:innen sichern den alltäglichen Zugang zu Lebensmitteln. Ohne funktionierende Lebensmitteldistribution kollabiert sehr schnell
  die Versorgung. Gleichzeitig sind einige Tätigkeitsbestandteile zunehmend automatisierbar (Self-Checkout, Onlinehandel), sodass der
  Gemeinwohlfaktor zwar über neutral, aber meist unter Müll/ÖPNV angesiedelt ist.

- **Qualifikation/Risiko `q ≈ 1,0–1,3`**  
  Die Tätigkeit ist stark routinisiert, erfordert aber Aufmerksamkeit, Umgang mit Geld, Scannertechnik, Kund:innen und oft auch einfache
  Problembehandlung. Das physische Risiko ist geringer als bei Verkehr/Medizin, die Belastung ist eher durch Taktung, monotone Arbeit und
  psychosozialen Stress geprägt.

**Muster:** Basisversorgung mit moderatem g und niedrigem bis mittlerem q. In realen Systemen häufig deutlich schlechter bezahlt, als es die
tatsächliche Funktion im Versorgungssystem nahelegen würde.

---

## Erkennbares Muster

Trägt man die fünf Beispielberufe in das g–q-Koordinatensystem ein, zeigen sich einige klare Strukturen:

- **Alle fünf** liegen **deutlich oberhalb** eines neutralen Gemeinwohlfaktors von `g = 1,0`. Sie sind also allesamt **explizit
  gemeinwohlrelevante Tätigkeiten** in deinem WT-System.
- Es bilden sich grob **zwei Cluster**:

1. **Hoher Gemeinwohlfaktor, mittlerer q**

- Müllabfuhr, Busfahrer:innen, Kassierer:innen
- Charakteristisch sind hohe physische/psychische Belastung, starke Systemkritikalität (Hygiene, Mobilität, Lebensmittelzugang), aber formal
  eher „mittlere“ Ausbildungswege.

2. **Hoher Gemeinwohlfaktor, hoher q**

- Allgemeinmediziner:innen, Apotheker:innen
- Lange Ausbildung, hohe Verantwortung, komplexe Entscheidungen mit teils gravierenden Folgen bei Fehlern.

- **Diskrepanz zur realen Vergütungsstruktur:**
  - Tätigkeiten im ersten Cluster sind in der Realität meist **unterbewertet**, obwohl ihr Gemeinwohlbeitrag hoch ist.
  - Tätigkeiten im zweiten Cluster sind zwar besser bezahlt, stehen aber vielerorts ebenfalls unter Druck (Arbeitsverdichtung, Bürokratie,
    Unterversorgung bestimmter Regionen).

In einem WT-System sollen diese Muster explizit und quantitativ erfassbar werden, um falsche Anreizstrukturen sichtbar zu machen und
umkehren zu können.

---

## Was das für deine Modellierung heißt

Aus diesen fünf Beispielen lassen sich bereits einige konkrete Designentscheidungen für deine WT-Zonen und Faktoren ableiten.

### Alle genannten Berufe gehören klar in `priority_i = 1` (Basisversorgung)

- Fakultativ kannst du innerhalb der Basisversorgung noch differenzieren (z.B. 1a: unmittelbar lebensrelevant, 1b: essentiell für Alltag &
  Teilhabe).
- Wichtig ist, dass sie **nicht** mit reinem Luxus- oder Prestige-Sektor in Konkurrenz um Aufmerksamkeit und Vergütung stehen, sondern als
  eigenes „Fundament“ der Versorgung modelliert werden.

### Feinere q-Bandbreiten innerhalb der Basisversorgung

Es lohnt sich, innerhalb der Basiszonen zwei typische q-Korridore festzulegen, z.B.:

- `q ≈ 1,2–1,6`: körperlich/organisatorisch belastend, mittlere Ausbildung, deutlich höher als „Standarddienstleistung“.  
  → Müllabfuhr, Busfahrer:innen, Teile der Kassentätigkeit.

- `q ≈ 1,8–2,4`: lange Ausbildung und/oder hohe Verantwortlichkeit, potenziell gravierende Fehlfolgen.  
  → Hausärzt:innen, Apotheker:innen, andere Gesundheitsberufe.

Damit kann dein System innerhalb der Basisversorgung gezielt nach Qualifikation/Risiko differenzieren, ohne den Gemeinwohlbeitrag zu
relativieren.

### Optionaler zusätzlicher Faktor für Belastung/Unsichtbarkeit

Ein erkennbares Muster ist, dass Tätigkeiten wie Müllabfuhr, Busfahren und Kassieren:

- einen **hohen Gemeinwohlbeitrag** haben,
- aber gesellschaftlich oft eine **geringe Anerkennung** und schlechte Arbeitsbedingungen erhalten.

Du könntest deshalb einen zusätzlichen Faktor einführen, zum Beispiel:

- `b_i` = Belastungs-/Unsichtbarkeitsfaktor (Dirty-Dangerous-Demeaning)

Dieser könnte sich aus Aspekten wie Schmutzarbeit, Stigmatisierung, monotoner Hochfrequenzarbeit und sozialen Stressoren speisen und z.B.:

- zusätzliche WT-Aufschläge,
- besondere Rotationsregeln,
- oder bevorzugten Zugang zu Regenerations- und Bildungszonen auslösen.

### Bestätigung der Zonenstruktur

Die Zuordnung zeigt auch, dass deine Intuition, Basisversorgung in getrennte Zonen für:

- physische Infrastruktur (Abfall),
- Mobilität (ÖPNV),
- Gesundheit (Diagnose/Behandlung),
- Gesundheitsdistribution (Apotheken),
- Lebensmitteldistribution (Supermärkte)

aufzuteilen, sehr gut zu einem differenzierten g–q-Modell passt.

Für die praktische Implementierung heißt das:

- Du kannst pro Zone **Standardbereiche** für `g_i` und `q_i` definieren.
- Einzelne Berufe werden dann als Punkte oder Intervalle innerhalb dieser Bereiche verortet.
- Auf dieser Basis kannst du `WT_rate_i`, Caps, Rotationsregeln und Zeitboden-spezifische Zugänge präziser kalibrieren.

### Anschlussfähigkeit an weitere Berufsfelder

Die hier erkannten Cluster bieten gleichzeitig Ankerpunkte für die Erweiterung auf andere Tätigkeiten:

- Weitere Infrastruktur- und Care-Berufe (Pflege, Reinigung, Erziehung, Logistik) lassen sich prüfen: liegen sie eher im „hohes g, mittleres
  q“-Cluster oder im „hohes g, hohes q“-Cluster?
- Luxus-, Prestige- oder stark profitorientierte Berufe können dagegen als Kontrastgruppe mit niedrigerem g, teils hohem q dienen.

So wird das g–q-Schema zur **diagnostischen Linse**, mit der du die Position verschiedener Berufsgruppen im [proto-Superorganismus](/content/superorganism-2-0#content)
systematisch untersuchen und später politische Entscheidungen über WT-Faktoren begründen kannst.
