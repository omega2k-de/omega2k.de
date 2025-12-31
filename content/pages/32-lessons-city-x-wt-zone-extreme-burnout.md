---
id: '32'
parent: '30'
slug: 'lessons-city-x-wt-zone-extreme-burnout'
topic: 'lessons-learned'
route: '/content/lessons-learned/city-x-wt-zone-extreme-burnout'
title: 'Lessons learned: Extrem-Zonen-Modell im Stadt-X-Pflegepilot'
description: 'Das Stadt-X-Szenario untersucht ein WT-Zonenmodell im Pflegesektor mit Extrem-Zone C und zeigt anhand durchgerechneter Beispiele, wie Burnout, neue Unterklassen und systemische Schieflagen entstehen – und welche Korrekturen für v0.3 nötig sind.'
keywords: 'superorganismus, weighted time token, wt-zonen, stadt x, pflege, burnout, extrem-zone, zeitsouveränität, arbeitszeit, charta, simulationsmodell, lessons learned'
version: 3
createdAt: '2025-12-05T22:39:34.731Z'
author: 'Me & GPT'
---

# Lessons learned: Extrem-Zonen-Modell im Stadt-X-Pflegepilot

## Kontext und Forschungsfrage

In „Stadt X“ soll ein **Weighted-Time-System (WT)** den Pflegesektor fairer, gesünder und resilienter machen.  
Die Leitidee: Tätigkeiten mit höherer Belastung, höherem Risiko und größerer Knappheit sollen **überproportional Zeit- und
Sicherheitsgewinne** bringen, statt ausschließlich monetär kompensiert zu werden.

**Aktueller Realitätsanker (Deutschland, Pflegebedarf):**  
Nach Destatis waren zum Jahresende 2023 knapp **5,7 Millionen Menschen pflegebedürftig** (SGB XI) – ein deutlicher Anstieg gegenüber 2021.
Das ist kein Detail, sondern die „Last“, gegen die jede Modellannahme zur Stundenbilanz plausibilisiert werden muss.

Wir untersuchen ein Modell mit drei WT-Zonen:

- **Zone A – Normal**: Helfer:innen, Basispflege, geringere Belastung.
- **Zone B – Hoch**: ambulante Pflege mit mittlerer Belastung.
- **Zone C – Extrem**: Intensivpflege, Nacht- und Hochrisiko-Schichten.

Zentrale Forschungsfrage:

Kann eine Extrem-Zone C gleichzeitig:  
> – hohe Belastung fair kompensieren,  
> – Burnout systematisch vermeiden  
> – und verhindern, dass in Zone A eine „unsichtbare Unterklasse“ entsteht?

Die Simulation ist bewusst als **Gedankenexperiment** angelegt: Die Zahlen sind plausibilitätsorientiert, nicht empirisch kalibriert.  
Sie dienen dazu, logische Bruchstellen im Design sichtbar zu machen.

**Präzisierung (Warum „Pflege“ als KRITIS-nah gedacht werden kann):**  
„Gesundheit“ ist als KRITIS-Sektor definiert; Ausfälle können nachhaltig wirkende Versorgungsengpässe und erhebliche Störungen verursachen.
Zudem bestehen sektorübergreifende Abhängigkeiten (u.a. Energie, Wasser, IT). Das ist für die Modelllogik relevant, weil
Burnout/Kapazitätsausfall in Zone C nicht isoliert bleibt, sondern in Kaskaden gedacht werden muss.

## Ausgangshypothese (v0.1)

### Grundidee: WT-Formel und Cap

- Einführung einer **WT-Zeitökonomie** neben dem Euro.
- Jede Stunde Arbeit erzeugt WT, gewichtet nach fünf Faktoren:

> - Belastung
> - Risiko
> - Knappheit
> - Qualifikation
> - Gemeinwohlbeitrag

- Schematische Formel:

  \[
  WT = (Belastung \cdot 0{,}3) + (Risiko \cdot 0{,}2) + (Knappheit \cdot 0{,}15) + (Qualifikation \cdot 0{,}2) + (Gemeinwohl \cdot 0{,}15)
  \]

  mit Skalen von 1–10 pro Faktor.

- Zusätzlich:
  - **Mindestwert** (z.B. 1 WT/h), damit niemand unter einen definierten Sockel fällt.
  - **Maximalwert (Cap)** (z.B. 5 WT/h), um Ausbeutung zu begrenzen und Extremwerte abzuschneiden.

**Präzisierung (Skalenbruch als bewusster Evolutionsschritt):**  
Diese v0.1-Skala (1–10, fünf Faktoren) ist ein frühes, didaktisches Setup. Spätere Sandbox-Versionen nutzen bewusst kompaktere Skalen (z.B.
1–3) und zusätzliche Strukturgrößen (Zeitkritikalität/Substituierbarkeit), weil sonst (a) Caps die Steuerungswirkung dominieren und (b)
Mess-/Proxy-Qualität schwer auditierbar wird. Der „Skalenwechsel“ ist daher kein Stilbruch, sondern eine Governance-Entscheidung.

### Erste Beispielrechnung

Persona 1: Nachtschicht Intensivpflege (Zone C)

> - Belastung = 9
> - Risiko = 8
> - Knappheit = 9
> - Qualifikation = 8
> - Gemeinwohl = 7

\[
WT_C = 9\cdot0{,}3 + 8\cdot0{,}2 + 9\cdot0{,}15 + 8\cdot0{,}2 + 7\cdot0{,}15
\]
\[
= 2{,}7 + 1{,}6 + 1{,}35 + 1{,}6 + 1{,}05 = 8{,}3 \,\text{WT/h}
\]

→ durch Cap gekappt auf **5 WT/h**.

Persona 2: ambulante Tagespflege (Zone B)

> - Belastung = 5
> - Risiko = 3
> - Knappheit = 4
> - Qualifikation = 6
> - Gemeinwohl = 5

\[
WT_B = 5\cdot0{,}3 + 3\cdot0{,}2 + 4\cdot0{,}15 + 6\cdot0{,}2 + 5\cdot0{,}15
\]
\[
= 1{,}5 + 0{,}6 + 0{,}6 + 1{,}2 + 0{,}75 = 4{,}65 \,\text{WT/h}
\]

**Delta:** 5 vs. 4,65 WT/h → nur ~7 % Unterschied, trotz massiv höherer Belastung und Risiko.

### Erste Probleme (v0.1)

- Viele anspruchsvollere Tätigkeiten stoßen direkt an den Cap → **Steuerungswirkung der Formel wird klein**.
- Extrem-Jobs sind nur geringfügig besser gestellt, obwohl der gesundheitliche Schaden deutlich höher ist.
- Normativ unklar:
  - Sollen Extrem-Jobs langfristig attraktiv gemacht werden?
  - Oder sollte das System die Nachfrage nach solchen Schichten mittelfristig **reduzieren**, nicht vergolden?

**Präzisierung (Cap als „harter Kompressor“):**  
Das Beispiel zeigt: Sobald ein Cap aktiv wird, werden Unterschiede in der Top-Zone „komprimiert“. Ein Cap ist wichtig gegen Überanreize,
aber er darf nicht die gesamte Regelung dominieren. In späteren Varianten wird daher typischerweise ein Teil der Kompensation in *
*Zeitpuffer/Sicherheitsgewinne** (Rotation, lebenslange Pflichtstundenreduktion, Regenerationsfenster) verschoben, statt nur WT/h zu
erhöhen.

## Re-Design: Zonen mit klarem Zeitboden (v0.2)

Wir wechseln von „Formel-Feintuning“ zu **Zonen mit expliziten Zielbildern**.

### Zeitboden und normatives Ziel

- **Zeitboden:** 200 WT/Monat = sichere Grundversorgung (Miete, Essen, Grundsicherheit + minimaler Puffer).
- Normatives Ziel: Jede Zone soll den Boden mit einer **fairen Obergrenze an Wochenstunden** erreichen können:

> - Zone A (Normal): max. 25 Std/Woche
> - Zone B (Hoch): max. 20 Std/Woche
> - Zone C (Extrem): max. 15 Std/Woche

Wir rechnen rückwärts:

\[
WT/h = \frac{200 \,\text{WT}}{\text{Monatsstunden}}
\]

Bei 4 Wochen/Monat:

- A: 25 Std/Woche → 100 Std/Monat  
  \[
  WT_A/h = 200 / 100 = 2
  \]

- B: 20 Std/Woche → 80 Std/Monat  
  \[
  WT_B/h = 200 / 80 = 2{,}5
  \]

- C: 15 Std/Woche → 60 Std/Monat  
  \[
  WT_C/h \approx 200 / 60 \approx 3{,}33
  \]

Damit erreichen alle drei Personas mit **unterschiedlicher Belastung** denselben Boden (200 WT/Monat), aber mit unterschiedlich viel
Arbeitszeit:  
Zone C braucht am wenigsten, Zone A am meisten.

**Präzisierung (Regulatorischer Realitätsanker in Krankenhäusern):**  
Für besonders pflegesensitive Krankenhausbereiche existieren Pflegepersonaluntergrenzen (PpUGV). Gleichzeitig sind Ausnahmen vorgesehen (
z.B. bei starken Patientenzahl-Erhöhungen wie Epidemien/Großschadensereignissen). Für das Modell ist das relevant: Gerade in
Extrem-Settings (Zone C) ist die reale Welt bereits ein Trade-off aus Mindeststandards und Krisenausnahmen — exakt das, was Stress-Szenarien
in WT sichtbar machen sollen.

### Beispiel: Ziel 300 WT/Monat (150 % Boden)

Angenommen, Personen zielen auf 150 % Boden (300 WT/Monat), z.B. für Rücklagen oder Schuldenabbau.

- A (2 WT/h):  
  \[
  300 / 2 = 150 \,\text{Std/Monat} \approx 37{,}5 \,\text{Std/Woche}
  \]

- B (2,5 WT/h):  
  \[
  300 / 2{,}5 = 120 \,\text{Std/Monat} \approx 30 \,\text{Std/Woche}
  \]

- C (3,33 WT/h):  
  \[
  300 / 3{,}33 \approx 90 \,\text{Std/Monat} \approx 22{,}5 \,\text{Std/Woche}
  \]

**Interpretation:**

- Alle erreichen denselben monetären Zielwert (300 WT/Monat),
- aber C braucht deutlich weniger Stunden als A,
- und A muss wesentlich mehr arbeiten, um B/C einzuholen.

## Burnout-Szenario und systemische Schieflagen

### Burnout in Zone C

Wenn C deutlich weniger Stunden für denselben Ziel-WT benötigt, entsteht ein **starker struktureller Anreiz**:

- Kurzfristig: „Gehe in C, arbeite weniger Stunden, baue schneller Schulden ab.“
- Mittelfristig: soziale Norm „Wer etwas erreichen will, muss durch C.“

Konsequenzen:

- Viele Menschen bleiben **länger in C**, als gesundheitlich tragbar ist.
- Rotationsregeln (z.B. max. 5 Jahre C, dann Pause) werden politisch verwässert oder informell umgangen – weil das System auf die hohen WT/h
  angewiesen ist.
- Burnout-Raten in C steigen; Ausfälle häufen sich; die Belastung wird auf eine schrumpfende Restgruppe verteilt.

**Präzisierung (Engpass-Umfeld als Verstärker):**  
Die BA ordnet Pflege- und Gesundheitsberufe weiterhin zu den Berufen mit den stärksten Engpässen ein. Für das Modell heißt das: Sobald Zone
C „attraktiv“ wird, steigt nicht automatisch die verfügbare Kapazität, weil Engpässe typischerweise auf Ausbildungs-/Einarbeitungszeiten und
Poolgröße zurückgehen. Das ist genau die Definition von „geringer Substituierbarkeit“ (in späteren Skalen: hohes s).

### Neue Unterklasse in Zone A

Die gleiche Logik erzeugt „von unten“ ein zweites Problem:

- Helfer:innen in A müssen bei 2 WT/h **deutlich mehr Stunden** leisten, um auf 300 WT/Monat zu kommen.
- Wer aus gesundheitlichen Gründen, wegen Care-Pflichten oder fehlender Qualifikation **nie in C** arbeiten kann, hängt strukturell
  hinterher.

Das Modell produziert damit:

- eine kleine, überlastete Hochrisiko-Gruppe in C als schnelle Aufsteiger:innen,
- und eine große Gruppe in A, die trotz unverzichtbarem Beitrag **dauerhaft mehr arbeiten** muss.

### Metabolismus von Stadt X

Zusätzlich zur individuellen Ebene stellen sich Fragen auf Systemebene:

- Im Gedankenexperiment wurden zeitweise **100 Pflegekräfte auf 1000 Einwohner** angenommen – deutlich mehr als realistisch.  
  Die Simulation überschätzt damit die verfügbare professionelle Pflegezeit.
- Gleichzeitig bleiben andere „Organe“ des Stadt-Superorganismus (Bildung, Energie, Ernährung, Infrastruktur) unterdefiniert.
- In Summe ist unklar, ob die Stunden in A/B/C **ausreichen**, um den realen Pflegebedarf zu decken, ohne chronische Unterversorgung oder
  Überlastung anderer Sektoren.

**Präzisierung (Pflegebedarf ist in großen Teilen „zu Hause“ und damit systemisch unsichtbar, wenn nicht modelliert):**  
Die amtliche Pflegestatistik zeigt in den Ländern konsistent: Ein großer Teil der Pflege findet vorwiegend zu Hause statt (häufig durch
Angehörige, Pflegegeld). Beispiel Baden-Württemberg (Pflegestatistik 2023): rund 85 % vorwiegend zu Hause, davon ein großer Teil
ausschließlich Pflegegeld/Angehörigenpflege. Das stützt die Designforderung, Care-Zeit nicht „außerhalb“ des Systems zu lassen, sonst
entsteht eine unterschätzte, nicht kompensierte Last.

**Präzisierung (Kaskaden-/KRITIS-Aspekt):**  
Gerade weil Gesundheit KRITIS-nah ist, muss das Modell explizit abbilden, wie Ausfälle (Burnout, Personalmangel, IT-Störungen) in
Abhängigkeit zu Energie/Wasser/IT wirken. BSI und BBK betonen diese sektorübergreifenden Abhängigkeiten im Gesundheitsbereich.

## Lessons learned (kondensiert)

- **Extrem-Zonen taugen nicht als Dauerkarriere**  
  Zone C darf nicht als langfristiger „schneller Aufstiegsweg“ angelegt sein.  
  Sie muss als **kurze Spitzenphase** mit strengen Gesundheitschecks, Pflichtpausen und Life-Time-Limits definiert werden.

- **Zeitboden muss für alle Zonen fair erreichbar sein**  
  Ein fester Boden ist nur dann gerecht, wenn Helfer:innen in A ihn mit **realistisch begrenzten Stunden** erreichen können.  
  B/C sollten vor allem **Lebenszeit, Sicherheit und Stabilität** bringen, nicht primär Konsumspitzen.

- **Keine unsichtbare Unterklasse in A**  
  Wenn A dauerhaft mehr Stunden leisten muss, um denselben Boden zu erreichen wie B/C, entsteht eine neue Unterklasse im System – nur in
  anderem Gewand.  
  Die Zonenlogik muss so kalibriert sein, dass A langfristig nicht chronisch „hinterherläuft“.

- **Burnout als harte Charta-Verletzung**  
  Hohe Burnout-Raten in C sind kein Kollateralschaden, sondern ein Indikator für die Verletzung von Grundrechten (Gesundheit,
  Unversehrtheit).  
  Burnout- und Ausfallindikatoren müssen Teil der **Feedbackregeln** sein (vgl. Teil V).

- **Superorganismus braucht eine Gesamt-Stundenbilanz**  
  Es reicht nicht, einen Sektor (Pflege) im WT-System zu optimieren.  
  Jede Zonenlogik muss in eine **Gesamtbilanz der Arbeitsstunden** von Stadt X eingebettet werden (Pflege, Bildung, Energie, Ernährung,
  Infrastruktur).

- **Unsichtbare Care-Arbeit einpreisen**  
  Ein relevanter Teil von Pflege findet unbezahlt im Haushalt statt.  
  Wenn diese Care-Arbeit nicht mit WT sichtbar und bewertet wird, bleiben strukturelle Ungerechtigkeiten – insbesondere zulasten von
  Frauen – bestehen.

**Präzisierung (Pflegebedarf-Dynamik als Grund für „v0.3 nötig“):**  
Wenn die Zahl der Pflegebedürftigen schneller steigt als rein demografisch erwartbar, verschiebt sich der Systemdruck: Das WT-Design muss
nicht nur „fairer verteilen“, sondern die Resilienz unter steigender Last beweisen (sonst wird C faktisch zur Dauerzone).

## Skizze für v0.3 und Rolle von KI-Simulationen

Aus diesen Lessons ergeben sich Korrekturen und nächste Untersuchungsschritte:

- **Zone C als Kurzzeit-Organ**
  - Max. 3 Jahre am Stück, 6–8 Jahre im Leben.
  - Obligatorische Health-Checks, danach verpflichtende Phasen in B/A.
  - WT-Vorteile teilweise in langfristige Zeitpuffer umwandeln (lebenslange Reduktion der Pflichtstunden statt Monats-Einkommensspitzen).

- **Floor-Kalibrierung von Zielbildern her**
  - Zuerst definieren: „Wie viele Stunden pro Woche sollen A/B/C *maximal* arbeiten müssen, um sicher zu leben?“
  - Erst danach WT/h daraus ableiten (statt umgekehrt) und gegen Charta-Prinzipien testen.

- **Care-Vollbilanz für Stadt X**
  - Kombination aus professioneller Pflege (A/B/C) und Angehörigenpflege in einem gemeinsamen WT-Budget.
  - Sicherstellen, dass die Gesamtstunden realistisch sind und keine chronische Unterversorgung entsteht.

- **KI-gestützte Parametervarianten**
  - Künftige Arbeitsschritte können systematisch von KI unterstützt werden:
    - Variation von Zonenparametern (WT/h, Zeitboden, Caps, Rotationslimits),
    - Simulation verschiedener Personas und Bevölkerungsstrukturen,
    - automatische Erkennung von Bruchstellen (z.B. Überlastung, Ungleichheitsprofile, sektorale Unterversorgung),
    - Vorschlag von alternativen v0.3+-Designs unter Einhaltung der Charta.

**Präzisierung (Datenanker für v0.3-Kalibrierung, ohne „Realbetrieb“):**

- Pflegestatistik (Destatis/Statistische Ämter): Pflegebedürftige, Versorgungskontexte (ambulant/stationär/Pflegegeld) als Last- und
  Strukturparameter.
- Engpassindikationen (BA): Pflege-/Gesundheitsberufe als Engpassumfeld → Proxy für geringe Substituierbarkeit und lange Reaktionszeiten.
- Mindestpersonalregeln (BMG, PpUGV): Realwelt-Constraint und Krisenausnahmen → Stress-Test-Parameter für Zone C.
- KRITIS-Abhängigkeiten (BSI/BBK): Kaskadenmodellierung zwischen Gesundheit, IT, Energie, Wasser.

Diese v0.3-Skizze ist kein fertiges Modell, sondern eine **nächste Hypothese**, die wiederum gegen Charta und Teil V getestet und durch
weitere Szenarien (auch in anderen Sektoren) ergänzt werden muss.

## Verknüpfte Kapitel

- [Teil III – Rechte, Grenzen und Zuteilung](/content/superorganism-2-0/part-iii-regulatory-framework#content)
- [Teil V – Prüfregeln, Feedback und Selbstregulation](/content/superorganism-2-0/part-v-self-regulation#content)
- [Charta des proto-Superorganismus – Version A](/content/superorganism-2-0/charta-variant-a#content)

## Quellenanker (Stand: 2025-12-31)

- Destatis – Pflege (5,7 Mio. Pflegebedürftige Ende 2023; Pressemitteilung/Übersicht):  
  https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Gesundheit/Pflege/_inhalt.html
- Bundesagentur für Arbeit – Presseinfo zur Engpasslage 2024 (Pflege-/Gesundheitsberufe mit stärksten Engpässen):  
  https://www.arbeitsagentur.de/presse/2025-25-qualifizierte-fachkraefte-weiterhin-gesucht
- BMG – Pflegepersonaluntergrenzen (PpUGV, Ausnahmen bei Epidemien/Großschadensereignissen):  
  https://www.bundesgesundheitsministerium.de/service/begriffe-von-a-z/p/pflegepersonaluntergrenzen.html
- BSI – KRITIS-Definition und Sektor Gesundheit (kritische Dienstleistungen; Abhängigkeiten):  
  https://www.bsi.bund.de/DE/Themen/Regulierte-Wirtschaft/Kritische-Infrastrukturen/Allgemeine-Infos-zu-KRITIS/allgemeine-infos-zu-kritis_node.html
  https://www.bsi.bund.de/DE/Themen/Regulierte-Wirtschaft/Kritische-Infrastrukturen/Sektorspezifische-Infos-fuer-KRITIS-Betreiber/Gesundheit/gesundheit.html
- BBK – KRITIS-Sektor Gesundheit (Einordnung, sektorübergreifende Abhängigkeiten):  
  https://www.bbk.bund.de/DE/Themen/Kritische-Infrastrukturen/Sektoren-Branchen/Gesundheit/gesundheit.html
