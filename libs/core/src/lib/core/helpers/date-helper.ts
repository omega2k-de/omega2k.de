import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export class DateHelper {
  public static getDateAndYearsAgo(birthdate: string): {
    date: dayjs.Dayjs;
    yearsAgo: number;
  } {
    const date: dayjs.Dayjs = dayjs(birthdate, 'YYYY-MM-DD', true);
    const yearsAgo: number = dayjs().diff(date, 'years');

    return { date, yearsAgo };
  }

  public static convertFormatFromISOtoEUR(date: string): string {
    return dayjs(date, 'YYYY-MM-DD', true).format('DD.MM.YYYY');
  }

  public static convertFormatFromEURtoISO(date: string): string {
    return dayjs(date, 'DD.MM.YYYY', true).format('YYYY-MM-DD');
  }
}
