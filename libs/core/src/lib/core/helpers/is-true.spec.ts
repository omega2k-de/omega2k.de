import { expect } from 'vitest';
import { MixedBooleanType } from '../interfaces/mixed-boolean.type';
import { isTrue } from './is-true';

describe('isTrue', () => {
  const values: { value: MixedBooleanType; expected: boolean }[] = [
    {
      value: '1',
      expected: true,
    },
    {
      value: '0',
      expected: false,
    },
    {
      value: 'true',
      expected: true,
    },
    {
      value: 'false',
      expected: false,
    },
    {
      value: true,
      expected: true,
    },
    {
      value: false,
      expected: false,
    },
    {
      value: '',
      expected: false,
    },
    {
      value: undefined,
      expected: false,
    },
    {
      value: null,
      expected: false,
    },
    {
      value: 0,
      expected: false,
    },
    {
      value: -43,
      expected: false,
    },
  ];

  test.each(values)(
    '#isTrue should convert $value to $expected',
    ({ value, expected }: { value: MixedBooleanType; expected: boolean }) => {
      expect(isTrue(value)).toStrictEqual(expected);
    }
  );
});
