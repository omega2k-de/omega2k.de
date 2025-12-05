import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(html?: string | null) {
    return this.sanitizer.bypassSecurityTrustHtml(typeof html === 'string' ? html : '');
  }
}
