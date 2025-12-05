import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FigureComponent, FigureConfig } from './figure.component';
import { MockDirectives } from 'ng-mocks';
import { NgOptimizedImage } from '@angular/common';
import { VibrateDirective } from '../../directives';

describe('FigureComponent', () => {
  let component: FigureComponent;
  let fixture: ComponentFixture<FigureComponent>;
  const figure1: FigureConfig = {
    details: {
      summary: '2011 bis 2025, Jahresmittel in Tausend Euro',
      content: `Das Diagramm zeigt eine Zeitreihe für Deutschland von 2011 bis 2025. Aufgetragen ist das Nettovermögen pro Kopf in Tausend Euro (y-Achse) für neun Vermögensdezile (D1–D9), also für die unteren 90 % der Bevölkerung, aufgeteilt in 10 %-Schritte. Die x-Achse ist das Jahr.`,
    },
    full: {
      width: 1800,
      height: 1050,
      path: '/cdn/images/monopoly/unfair_competition.webp',
    },
    image: {
      width: 640,
      height: 373,
      path: '/cdn/images/monopoly/unfair_competition_640.webp',
      alt: 'Diagramm: Deutschland - Nettovermögen pro Kopf nach Dezilen',
    },
    legend: 'Deutschland - Nettovermögen pro Kopf nach Dezilen',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FigureComponent, MockDirectives(NgOptimizedImage, VibrateDirective)],
    }).compileComponents();

    fixture = TestBed.createComponent(FigureComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', figure1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
