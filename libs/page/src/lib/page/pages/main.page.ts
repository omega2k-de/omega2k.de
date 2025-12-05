import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FigureConfig, IconDirective, VersionComponent } from '@o2k/ui';
import dayjs from 'dayjs';
import { RouterLink } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'page-main-page',
  imports: [VersionComponent, IconDirective, RouterLink],
  templateUrl: './main.page.html',
  styleUrl: './main.page.scss',
})
export class MainPage {
  readonly createdAt = '2025-11-23T19:09:52.360Z';
  protected figure1: FigureConfig = {
    details: {
      summary:
        'Ist die Existenz bewusster Wesen nicht doch bereits der höchste Sinn, den das Universum haben kann?',
      content: `Auf dem Bild stehen zwei Personen am Strand und schauen aufs Meer. Links ein Mädchen, rechts eine erwachsene Frau. Über dem Mädchen steht in einer Sprechblase: „What’s the meaning of life?“ (Was ist der Sinn des Lebens?). Über der Frau steht: „You are.“ (Du bist es.)
Unten ist das Bild zusätzlich beschriftet:
unter dem Mädchen: „mankind“ (Menschheit)
unter der Frau: „universe“ (Universum)`,
    },
    full: {
      width: 1536,
      height: 1024,
      path: '/cdn/images/life/the_meaning_of_life.webp',
    },
    image: {
      width: 640,
      height: 427,
      path: '/cdn/images/life/the_meaning_of_life_640.webp',
      alt: 'Comic: So, then we decided not to do much to prevent climate change because it would hurt economy...',
    },
    legend: 'KI generiertes Bild über den Sinn des Lebens',
  };
  protected readonly dayjs = dayjs;
}
