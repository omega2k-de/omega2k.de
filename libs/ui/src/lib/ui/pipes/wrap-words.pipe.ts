import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import escapeStringRegexp from 'escape-string-regexp';

@Pipe({
  name: 'wrapWords',
})
export class WrapWordsPipe implements PipeTransform {
  private domSanitizer = inject(DomSanitizer);
  private regexpCache = new Map<string, RegExp>();

  transform(
    value: string | undefined,
    search: string,
    separator = ' ',
    tagName: keyof HTMLElementTagNameMap = 'mark'
  ): SafeHtml | undefined {
    if (!value) return value;

    const words = search
      .split(separator)
      .map(word => word.trim())
      .filter(word => word.length > 0);
    if (words.length === 0) return this.domSanitizer.bypassSecurityTrustHtml(value);

    const escapedWords = words.map(word => escapeStringRegexp(word));
    const regexp = this.getRegExp(search, escapedWords);
    const html = value.replace(regexp, `<${tagName}>$1</${tagName}>`);
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }

  private getRegExp(search: string, escapedWords: string[]): RegExp {
    if (this.regexpCache.has(search)) {
      return this.regexpCache.get(search) as RegExp;
    }

    const regexp = new RegExp(`(${escapedWords.join('|')})`, 'ig');
    this.regexpCache.set(search, regexp);
    return regexp;
  }
}
