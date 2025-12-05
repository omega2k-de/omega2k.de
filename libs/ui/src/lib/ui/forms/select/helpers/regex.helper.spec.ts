import { RegexHelper } from '.';

describe('RegexHelper', () => {
  it('#searchString should transform', () => {
    expect(RegexHelper.searchString('some multiple search :strings?')).toStrictEqual(
      /\s?(some|multiple|search|:strings\?)/i
    );
  });
});
