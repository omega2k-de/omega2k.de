import { Component } from '@angular/core';
import { IconDirective } from '../directives';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ui-footer',
  imports: [IconDirective, NgOptimizedImage, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  host: {
    '[attr.aria-label]': '"Footer"',
    class: 'nm-surface nm-raised',
  },
})
export class FooterComponent {}
