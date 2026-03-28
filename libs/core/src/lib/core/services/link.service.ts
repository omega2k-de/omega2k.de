import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export interface LinkTagDefinition {
  rel: string;
  href: string;
}

@Injectable({ providedIn: 'root' })
export class LinkService {
  private readonly document = inject(DOCUMENT);

  updateTag({ rel, href }: LinkTagDefinition): HTMLLinkElement {
    const selector = `link[rel='${rel}']`;
    const existing = this.document.head.querySelector(selector) as HTMLLinkElement | null;

    if (existing) {
      existing.setAttribute('href', href);
      return existing;
    }

    const linkElement = this.document.createElement('link');
    linkElement.setAttribute('rel', rel);
    linkElement.setAttribute('href', href);
    this.document.head.appendChild(linkElement);
    return linkElement;
  }
}
