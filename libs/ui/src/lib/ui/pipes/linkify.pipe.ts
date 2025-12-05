import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkify',
  pure: true,
})
export class LinkifyPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  private readonly urlPattern = /((https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,;:!?)])/gi;

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    const escaped = escapeHtml(value);
    const linked = escaped.replace(this.urlPattern, (match: string) => {
      const hasProtocol = /^https?:\/\//i.test(match);
      const isWww = /^www\./i.test(match);

      if (!hasProtocol && !isWww) {
        return match;
      }

      const href = hasProtocol ? match : `https://${match}`;
      if (!/^https?:\/\//i.test(href)) {
        return match;
      }

      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(linked);
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
