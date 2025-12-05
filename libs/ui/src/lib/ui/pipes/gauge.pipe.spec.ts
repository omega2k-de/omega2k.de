import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GaugeParams, GaugePipe } from './gauge.pipe';

describe('GaugePipe', () => {
  let pipe: GaugePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GaugePipe,
        {
          provide: LOCALE_ID,
          useValue: 'de-DE',
        },
      ],
    });

    pipe = TestBed.inject(GaugePipe);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('#transform should return valid data', () => {
    type TestData = {
      text: string;
      max: number;
      decimals: number;
      expected: GaugeParams;
    };

    const data: TestData[] = [
      {
        text: 'test some stupid',
        max: 128,
        decimals: 1,
        expected: {
          color: 'rgb(95,112,229)',
          display: '64,8 %',
          entropy: 83,
          length: 16,
          percent: 64.84375,
        },
      },
      {
        text: 'SUPER test TOKEN password WORD based',
        max: 128,
        decimals: 1,
        expected: {
          color: 'rgb(124,252,0)',
          display: '100,0 %',
          entropy: 215,
          length: 36,
          percent: 100,
        },
      },
      {
        text: 'ä+234flkÖPE)=§$_:MKPOK!ß@`2n>',
        max: 256,
        decimals: 3,
        expected: {
          color: 'rgb(30,144,255)',
          display: '75,000 %',
          entropy: 192,
          length: 29,
          percent: 75,
        },
      },
      {
        text: '%ä+234flkÜPE)=§$_:MKPOK!ß@`2n>',
        max: 128,
        decimals: 0,
        expected: {
          color: 'rgb(124,252,0)',
          display: '100 %',
          entropy: 199,
          length: 30,
          percent: 100,
        },
      },
      {
        text: '',
        max: 128,
        decimals: 3,
        expected: {
          color: 'rgb(255,0,0)',
          display: '0,000 %',
          entropy: 0,
          length: 0,
          percent: 0,
        },
      },
    ];

    it.each(data)('$text,$max,$decimals', ({ text, max, decimals, expected }: TestData) => {
      expect(pipe.transform(text, max, decimals)).toEqual(expected);
    });
  });
});
