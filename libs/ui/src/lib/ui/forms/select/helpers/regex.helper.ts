import escapeStringRegexp from 'escape-string-regexp';

export class RegexHelper {
  static searchString(label: string): RegExp {
    const escaped = escapeStringRegexp(label);
    return new RegExp(`\\s?(${escaped.split(' ').join('|')})`, 'i');
  }
}
