import dayjs from 'dayjs';
import mockDate from 'mockdate';
import { DateHelper } from '.';

describe('DateHelper', () => {
  let dateHelper: DateHelper;

  beforeEach(() => {
    dateHelper = new DateHelper();
  });

  it('should create an instance', () => {
    expect(dateHelper).toBeInstanceOf(DateHelper);
  });

  describe('getDateAndYearsAgo', () => {
    mockDate.set('2020-01-01');

    type GetDateAndYearsAgoTestSet = {
      name: string;
      birthdate: string;
      expected: {
        date: dayjs.Dayjs;
        yearsAgo: number;
      };
    };

    const getDateAndYearsAgoTestSets: GetDateAndYearsAgoTestSet[] = [
      {
        name: 'slightly under age 18',
        birthdate: '2002-01-02',
        expected: {
          date: dayjs('2002-01-02', 'YYYY-MM-DD', true),
          yearsAgo: 17,
        },
      },
      {
        name: 'exactly age 18',
        birthdate: '2002-01-01',
        expected: {
          date: dayjs('2002-01-01', 'YYYY-MM-DD', true),
          yearsAgo: 18,
        },
      },
      {
        name: 'over age 18',
        birthdate: '2001-05-01',
        expected: {
          date: dayjs('2001-05-01', 'YYYY-MM-DD', true),
          yearsAgo: 18,
        },
      },
    ];

    it.each(getDateAndYearsAgoTestSets)(
      '$name',
      ({ birthdate, expected }: GetDateAndYearsAgoTestSet) => {
        expect(DateHelper.getDateAndYearsAgo(birthdate)).toEqual(expected);
      }
    );
  });

  describe('convertFormatFromISOtoEUR', () => {
    it('should convert YYYY-MM-DD to DD.MM.YYYY', () => {
      expect(DateHelper.convertFormatFromISOtoEUR('1990-05-01')).toEqual('01.05.1990');
    });
  });

  describe('convertFormatFromEURtoISO', () => {
    it('should convert DD.MM.YYYY to YYYY-MM-DD', () => {
      expect(DateHelper.convertFormatFromEURtoISO('01.05.1990')).toEqual('1990-05-01');
    });
  });
});
