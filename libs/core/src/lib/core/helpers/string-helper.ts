export class StringHelper {
  static LOWERCASE_ALPHA = 'abcdefghijklmnopqrstuvwxyz';
  static UPPERCASE_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static DIGITS = '0123456789 ';
  static INTERPUNCT1 = '!@#$%^&*()';
  static INTERPUNCT2 = '~`-_=+[]{}\\|;:\'",.<>?/';

  private static alphabetSize = (str: string): number => {
    const map = new Map<'ac' | 'pu' | 'di' | 'al' | 'uc' | 'size', number>();
    for (let i = 0; i < str.length; i++) {
      const c = str[i] as string;

      if (str.indexOf(c) !== i) {
        continue;
      }

      if (StringHelper.LOWERCASE_ALPHA.indexOf(c) !== -1) {
        map.set('al', StringHelper.LOWERCASE_ALPHA.length);
      } else if (StringHelper.UPPERCASE_ALPHA.indexOf(c) !== -1) {
        map.set('ac', StringHelper.UPPERCASE_ALPHA.length);
      } else if (StringHelper.DIGITS.indexOf(c) !== -1) {
        map.set('di', StringHelper.DIGITS.length);
      } else if (StringHelper.INTERPUNCT1.indexOf(c) !== -1) {
        map.set('pu', StringHelper.INTERPUNCT1.length);
      } else if (StringHelper.INTERPUNCT2.indexOf(c) !== -1) {
        map.set('size', StringHelper.INTERPUNCT2.length);
      } else if (c.charCodeAt(0) > 127) {
        map.set('al', 26);
        map.set('uc', (map.get('uc') ?? 0) + 1);
      }
    }

    return [...map.values()].reduce((p, c) => p + c, 0);
  };

  static entropy = (str?: string): number => {
    if (!str) {
      return 0;
    }
    return Math.round(str.length * (Math.log(StringHelper.alphabetSize(str)) / Math.log(2)));
  };
}
