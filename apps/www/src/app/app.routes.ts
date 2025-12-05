import { allCardsResolver, cardsResolver, omega2k, pageResolver, SeoRoute } from '@o2k/core';
import { Route } from '@angular/router';

export const appRoutes: (SeoRoute | Route)[] = [
  {
    path: '',
    loadComponent: () => import('@o2k/page').then(c => c.MainPage),
    data: {
      title: 'Neu auf omega2k.de?',
      description:
        'Willkommen in meinen Gedanken – einem Ort, an dem Logik und Gerechtigkeit Priorität haben.',
      author: omega2k,
      keywords:
        'Handbuch proto-Superorganismus Menschheit Demokratie Kapitalismus Energiewende Gerechtigkeit Wissenschaft Evidenz Kritik Reform Umdenken',
      twitter: {
        image: {
          url: '/cdn/images/life/the_meaning_of_life_1200x600.webp',
          alt: 'Ist die Existenz bewusster Wesen nicht doch bereits der höchste Sinn, den das Universum haben kann?',
          width: '1200',
          height: '600',
        },
      },
    },
  },
  {
    path: '',
    pathMatch: 'full',
    outlet: 'teaser',
    loadComponent: () => import('@o2k/page').then(c => c.TeaserOutlet),
  },
  {
    path: '',
    pathMatch: 'full',
    outlet: 'aside',
    data: {
      parallax: {
        src: '/cdn/images/manual/superorganism-2-0.webp',
        srcset: `
          /cdn/images/manual/superorganism-2-0.webp 1024w,
          /cdn/images/manual/superorganism-2-0.webp 1440w,
          /cdn/images/manual/superorganism-2-0.webp 1920w
        `,
        sizes: '(min-width: 1024px) 40vw, 100vw',
        alt: 'Superorganism 2.0',
        align: 'left',
        intensity: 1,
      },
    },
    loadComponent: () => import('@o2k/page').then(c => c.ParallaxOutlet),
  },
  {
    path: 'imprint',
    children: [
      {
        path: '',
        loadComponent: () => import('@o2k/page').then(c => c.ImprintPage),
      },
      {
        path: '',
        outlet: 'aside',
        loadComponent: () => import('@o2k/page').then(c => c.AvatarOutlet),
      },
    ],
    data: {
      title: 'Impressum – Verantwortlich für omega2k.de | Patrick Kracht',
      description:
        'Impressum von omega2k.de. Kontaktinformationen, rechtlich verantwortliche Person und Hinweise zur Erreichbarkeit. Transparente Angaben nach § 5 TMG.',
      author: omega2k,
      keywords:
        'Impressum, Anbieterkennzeichnung, omega2k, Patrick Kracht, Kontakt, gesetzliche Informationen',
      twitter: {
        title: 'Impressum – omega2k.de',
        description:
          'Verantwortlich für omega2k.de: Patrick Kracht. Hier findest du alle Pflichtangaben gemäß § 5 TMG sowie Kontaktmöglichkeiten.',
        image: {
          url: '/cdn/images/imprint_1200x800.webp',
          alt: 'Impressum mit Erde und Richterhammer',
          width: '1200',
          height: '800',
        },
      },
    },
  },
  {
    path: 'controls',
    children: [
      {
        path: '',
        loadComponent: () => import('@o2k/page').then(c => c.ControlsPage),
      },
      {
        path: '',
        outlet: 'aside',
        loadComponent: () => import('@o2k/page').then(c => c.ControlsOutlet),
      },
    ],
    data: {
      title: 'Controls – Einstellungen in omega2k.de | Patrick Kracht',
      description:
        'Impressum von omega2k.de. Kontaktinformationen, rechtlich verantwortliche Person und Hinweise zur Erreichbarkeit. Transparente Angaben nach § 5 TMG.',
      author: omega2k,
      keywords:
        'Impressum, Anbieterkennzeichnung, omega2k, Patrick Kracht, Kontakt, gesetzliche Informationen',
      twitter: {
        title: 'Impressum – omega2k.de',
        description:
          'Verantwortlich für omega2k.de: Patrick Kracht. Hier findest du alle Pflichtangaben gemäß § 5 TMG sowie Kontaktmöglichkeiten.',
        image: {
          url: '/cdn/images/imprint_1200x800.webp',
          alt: 'Impressum mit Erde und Richterhammer',
          width: '1200',
          height: '800',
        },
      },
    },
  },
  {
    path: 'impressum',
    pathMatch: 'full',
    redirectTo: 'imprint',
  },
  {
    path: 'privacy',
    children: [
      {
        path: '',
        loadComponent: () => import('@o2k/page').then(c => c.PrivacyPage),
        data: {
          title: 'Datenschutz – klar, verständlich & transparent | omega2k',
          description:
            'Wie omega2k.de mit deinen Daten umgeht: ohne Tracking, ohne Werbe-Profile und mit möglichst wenig technischen Daten. Erfahre, was lokal gespeichert wird und welche Rechte du hast.',
          author: omega2k,
          keywords:
            'Datenschutz, DSGVO, Datenverarbeitung, Privatsphäre, Cookies, Nutzerrechte, Datenkontrolle, Websicherheit',
          twitter: {
            title: 'Datenschutz – klar, verständlich & transparent | omega2k',
            description:
              'Wie omega2k.de mit deinen Daten umgeht: ohne Tracking, ohne Werbe-Profile und mit möglichst wenig technischen Daten. Erfahre, was lokal gespeichert wird und welche Rechte du hast.',
            image: {
              url: '/cdn/images/privacy_1200x600.webp',
              alt: `Datenschutz – klar, verständlich & transparent | omega2k`,
              width: '1200',
              height: '600',
            },
          },
        },
      },
      {
        path: '',
        outlet: 'aside',
        loadComponent: () => import('@o2k/page').then(c => c.AvatarOutlet),
      },
    ],
  },
  {
    path: 'content',
    pathMatch: 'full',
    data: {
      title: 'Gedanken-Pool',
      description:
        'Stell dir vor, die Menschheit wäre nicht nur eine lose Ansammlung von Staaten, Unternehmen und Einzelnen – sondern ein einziger, hochkomplexer Organismus. Mit einem Nervensystem (Information und Politik), einem Stoffwechsel (Energie, Ressourcen, Arbeit), einem Immunsystem (Recht, Normen, Kontrolle) und einer Umwelt, in der er nur überlebt, wenn er nicht seine eigene Lebensgrundlage zerstört. Genau diesen Gedanken nimmt diese Reihe ernst – nicht als Metapher für ein Plakat, sondern als analytisches Werkzeug: Was passiert, wenn wir unsere aktuelle Welt so betrachten, als wollten wir ihre „Gesundheit“ wirklich messen und aktiv verbessern?',
      author: omega2k,
      keywords: 'brain pool Menschheit Universum Gedanken Lösungen Ideen Plan',
      twitter: {
        image: {
          url: '/cdn/images/manual/superorganism-2-0_1200x600.webp',
          alt: `Gedanken-Pool: proto-Superorganismus Menschheit 2.0`,
          width: '1200',
          height: '600',
        },
      },
    },
    children: [
      {
        path: '',
        outlet: 'teaser',
        loadComponent: () => import('@o2k/page').then(c => c.TeaserOutlet),
      },
      {
        path: '',
        pathMatch: 'full',
        outlet: 'cards',
        resolve: {
          cards: allCardsResolver,
        },
        loadComponent: () => import('@o2k/page').then(c => c.CardsOutlet),
      },
    ],
  },
  {
    path: 'content/:slug',
    pathMatch: 'full',
    resolve: {
      page: pageResolver,
    },
    children: [
      {
        path: '',
        loadComponent: () => import('@o2k/page').then(c => c.ContentPage),
      },
      {
        path: '',
        outlet: 'cards',
        resolve: {
          cards: cardsResolver,
        },
        loadComponent: () => import('@o2k/page').then(c => c.CardsOutlet),
      },
      {
        path: '',
        outlet: 'aside',
        loadComponent: () => import('@o2k/page').then(c => c.StructureOutlet),
      },
    ],
  },
  {
    path: 'content/:topic/:slug',
    pathMatch: 'full',
    resolve: {
      page: pageResolver,
    },
    children: [
      {
        path: '',
        loadComponent: () => import('@o2k/page').then(c => c.ContentPage),
      },
      {
        path: '',
        outlet: 'cards',
        resolve: {
          cards: cardsResolver,
        },
        loadComponent: () => import('@o2k/page').then(c => c.CardsOutlet),
      },
      {
        path: '',
        outlet: 'aside',
        loadComponent: () => import('@o2k/page').then(c => c.StructureOutlet),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('@o2k/page').then(c => c.Error404Page),
    data: {
      title: 'Die Seite wurde nicht gefunden',
      description:
        'Es tut mir leid, aber die Seite ist entweder noch nie vorhanden gewesen, oder absichtlich entfernt worden. Vielleicht braucht das Update auch ein paar Sekunden länger.',
      author: omega2k,
    },
  },
];
