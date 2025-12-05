import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { VibrateDirective } from '../../directives';

export interface FigureDetailsConfig {
  summary: string;
  content: string;
}
export interface FigureImageConfig {
  width: number;
  height: number;
  path: string;
  alt: string;
}

export interface FigureConfig {
  image: FigureImageConfig;
  full?: Partial<FigureImageConfig>;
  legend?: string;
  details?: FigureDetailsConfig;
}

@Component({
  selector: 'ui-figure',
  imports: [NgOptimizedImage, VibrateDirective],
  templateUrl: './figure.component.html',
  styleUrl: './figure.component.scss',
})
export class FigureComponent {
  readonly config = input.required<FigureConfig>();
}
