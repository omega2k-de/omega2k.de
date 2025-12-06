---
id: '30'
parent: '1'
slug: 'lessons-learned'
topic: 'lessons-learned'
route: '/content/lessons-learned'
title: 'Lessons learned: Szenarienlabor für den proto-Superorganismus 2.0'
description: 'Das Lessons-Learned-Labor dokumentiert, wie konkrete Szenarien für den proto-Superorganismus 2.0 modelliert, simuliert, korrigiert und ausgewertet werden – inklusive WT-Ökonomie, Pflegepilot Stadt X und künftige Experimente.'
keywords: 'superorganismus 2.0, weighted time, wt-ökonomie, stadt x, pflegepilot, burnout, lessons learned, szenarienlabor, simulationsmodell, zeitwährung, charta, feedbackschleifen'
version: 1
createdAt: '2025-12-05T20:31:11.758Z'
author: 'Me & GPT'
---

# Lessons learned: Am Beispiel lernen

## Kontext und Ziel der Rubrik

Der [proto-Superorganismus 2.0](/content/superorganism-2-0#content) ist bewusst **hypothesengetrieben** angelegt.  
Teil I–V und die Charta beschreiben Diagnose, Metapher, Rechte/Grenzen, Lösungsräume und Prüfschema des Systems.

Was dort fehlt, sind durchgerechnete **Szenarien**, an denen sichtbar wird:

- wie sich bestimmte Designentscheidungen (z.B. eine WT-Zeitwährung, Zonenmodelle, Rotationslogiken) konkret auswirken,
- wo Modelle unter realistischen Annahmen brechen,
- welche Anpassungen nötig sind, um Charta-Ziele auch operativ einzuhalten.

Diese Rubrik versteht sich als **Szenarienlabor / Lessons-Learned-Logbuch**:

- Wir wählen einen **Teilaspekt** des proto-Superorganismus (z.B. Pflegesektor in „Stadt X“).

> _siehe [Grok mit Runde 1: Analyse des Burnout-Szenarios](https://x.com/grok/status/1996964318315987162?s=20)_

- Wir formulieren eine **explizite Hypothese** (z.B. WT-Zonen mit Extrem-Zone C).
- Wir **simulieren, rechnen, justieren** – und dokumentieren, wo das Modell scheitert oder tragfähig bleibt.
- Wir destillieren daraus **Lessons learned** und definieren offene Fragen für die nächste Iteration.

Ziel ist nicht, fertige Blaupausen zu präsentieren, sondern einen **nachvollziehbaren Lernpfad**:  
Wie verändern sich Annahmen, wenn man sie ernsthaft durchspielt?

## Aufbau der einzelnen Szenarien

Jeder Eintrag unter `/content/lessons/...` folgt einem konsistenten Schema:

### Kontext

- Worum geht es?
- Welcher „Organbereich“ des proto-Superorganismus wird simuliert (z.B. Pflege, Energie, Bildung)?
- Welche Teile des Handbuchs (Teil I–V, Charta) sind direkt berührt?

### Ausgangshypothese

- Welche Idee wird getestet (z.B. drei WT-Zonen mit Extrem-Zone)?
- Welche normativen Ziele sind gesetzt (Gerechtigkeit, Öko-Integrität, Zeitboden, Demokratie)?
- Welche impliziten Annahmen über Verhalten, Politik, Technik liegen darunter?

### Setup und Annahmen

- Zentrale Parameter (z.B. Zeitboden in WT, Stundenkontingente, Zonen, Rotationsregeln).
- Definition von **Personas** (z.B. Intensivpflegekraft, ambulante Pflege, Helfer:in).
- Vereinfachungen und bewusste Modellgrenzen (was wird nicht abgebildet?).

### Simulation und Rechnungen

- Durchgerechnete Beispiele (Monats- oder Jahresrechnungen) mit kommentierten Zwischenschritten.
- Sensitivitätsbetrachtungen, wo sinnvoll:
  - Was passiert bei Zielverschiebungen (z.B. 150 % vs. 200 % Zeitboden)?
  - Was passiert bei geänderter Verteilung zwischen Zonen (mehr/weniger Extrem-Jobs)?
- Abgleich mit Charta und Teil V (Prüfregeln, Feedback, Selbstregulation).

### Beobachtete Probleme

- Wo verletzt das Szenario Charta-Ziele (Gerechtigkeit, Gesundheit, Demokratie, Resilienz)?
- Wo entstehen unerwünschte Nebenwirkungen (z.B. neue Unterklassen, Burnout-Hotspots, strukturelle Überlastung)?
- Wo fehlen Daten oder Modellkomponenten (z.B. Gesamtstundenbilanz über alle Sektoren)?

### Lessons learned (kondensiert)

- 3–8 präzise Schlussfolgerungen:
  - Was behalten wir als robust?
  - Was verwerfen oder ändern wir explizit?
  - Welche Design-Prinzipien lassen sich verallgemeinern?

### Nächste Iteration / offene Forschungsfragen

- Skizze der nächsten Modellvariante (v0.x+1).
- Konkrete Forschungsfragen:
  - Welche Parameter sollen als Nächstes variiert werden?
  - Welche zusätzlichen Sektoren oder Nebenbedingungen müssen ergänzt werden?
  - Welche empirischen Daten wären nötig, um die Annahmen besser zu kalibrieren?

Damit entsteht im Laufe der Zeit ein **„Laborjournal“ des proto-Superorganismus 2.0**:  
Leser:innen sehen nicht nur Endergebnisse, sondern auch, *warum* bestimmte Varianten verworfen und andere bevorzugt werden.

## Rolle von KI-gestützter Modellsimulation

Die Lessons-Rubrik ist bewusst so strukturiert, dass sie sich für **KI-gestützte Simulationen** eignet:

- Die Modellannahmen (WT-Formeln, Zonen, Caps, Rotationsregeln) sind formalisiert genug, um sie als **Prompt-Eingabe** zu verwenden.
- KI-Modelle können systematisch:
  - Parameter-Varianten durchspielen,
  - Persona-Profile kombinieren,
  - Nebenbedingungen (Charta, Teil V) prüfen,
  - und aus vielen Läufen **strukturierte Feedback-Reports** erzeugen.

Typische Aufgaben für eine KI im Rahmen dieser Rubrik:

- Generieren von **Szenario-Matrizen** (z.B. unterschiedliche WT-Zonen, Zeitboden, Verteilungsziele).
- Durchrechnen von Persona-Kombinationen und Sektor-Bilanzen für eine fiktive Stadt X.
- Identifikation von **Bruchstellen** (z.B. Burnout-Cluster, Unterversorgung, neue Ungleichheiten).
- Vorschlag von v0.x+1-Modellen mit klaren Begründungen.

Eine entsprechende Prompt-Struktur für solche Simulationen wird separat dokumentiert (z.B. unter „How-To: KI-gestützte Szenarien“).

## Bisherige Beispiele

### WT-Zonen und Extrem-Burnout im Pflegesektor von Stadt X

[Stadt X – WT-Zonen und Extrem-Burnout](/content/lessons/city-x-wt-zone-extreme-burnout)

- **Thema:** WT-Zonen (Normal/Hoch/Extrem) im Pflegesektor von „Stadt X“.
- **Forschungsfrage:** Wie weit trägt ein Zonenmodell mit Extrem-Zone C, bevor es zu Burnout, neuer Ungleichheit und systemischer Schieflage
  führt?
- **Kern-Lessons:** Extrem-Zonen taugen nicht als Dauerkarriere, Zeitboden muss für alle Zonen fair erreichbar sein, unsichtbare Care-Arbeit
  muss mitgedacht werden, und sektorale Optimierung ohne Gesamtbilanz des Stadt-Superorganismus ist systemisch instabil.

Weitere Beispiele (Energie, Bildung, ÖPNV, Müll, digitale Commons etc.) können nach demselben Schema ergänzt werden:

- `/content/lessons/example-energy-storage-x`
- `/content/lessons/example-education-timebudget-y`
- …

Jeder neue Eintrag sollte klar angeben, **welche Teile des Handbuchs** er testet, und mit ihnen verlinkt sein (z.B. Teil III, Teil V, Charta
A).
