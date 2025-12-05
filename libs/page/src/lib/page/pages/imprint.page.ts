import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { IconDirective } from '@o2k/ui';

@Component({
  selector: 'page-imprint-page',
  imports: [NgOptimizedImage, IconDirective],
  templateUrl: './imprint.page.html',
  styleUrl: './imprint.page.scss',
})
export class ImprintPage {}
