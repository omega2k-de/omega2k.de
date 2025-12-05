import { expect } from 'vitest';
import { JsonHelper } from '.';

describe('JsonHelper', () => {
  type mixed = string | object | boolean | number | null | undefined | mixed[];

  interface JsonHelperSetup {
    value:
      | {
          [key: string]: mixed | JsonHelperSetup['value'];
          error: mixed | JsonHelperSetup['value'];
          error2: mixed | JsonHelperSetup['value'];
        }
      | mixed;
    space?: string | number;
    expected: unknown;
  }

  const data: JsonHelperSetup[] = [
    {
      value: undefined,
      expected: undefined,
    },
    {
      value: null,
      expected: 'null',
    },
    {
      value: true,
      expected: 'true',
    },
    {
      value: 'string',
      expected: '"string"',
    },
    {
      value: 42,
      expected: '42',
    },
    {
      value: 13.37,
      expected: '13.37',
    },
    {
      value: {
        prop: 'value',
        state: false,
      },
      expected: '{"prop":"value","state":false}',
    },
    {
      value: {
        prop: 'value',
        state: false,
        undef: undefined,
        null: null,
      },
      expected: '{"null":null,"prop":"value","state":false}',
    },
  ];

  const circularReference: JsonHelperSetup = {
    value: {
      prop: 'value',
      error: null,
      error2: null,
      parent: {
        arr: ['a', 'b', 'c'],
      },
    },
    expected: '{"parent":{"arr":["a","b","c"]},"prop":"value"}',
  };

  if (
    circularReference.value &&
    typeof circularReference.value === 'object' &&
    'error' in circularReference.value
  ) {
    circularReference.value.error = circularReference.value;
  }
  if (
    circularReference.value &&
    typeof circularReference.value === 'object' &&
    'error2' in circularReference.value
  ) {
    circularReference.value.error2 = circularReference.value;
  }

  data.push(circularReference);

  it.each(data)('#stringyfy should return $value transformed', ({ value, space, expected }) => {
    const result = JsonHelper.stringify(value, space);
    expect(circularReference.value).toHaveProperty('error', circularReference.value);
    expect(circularReference.value).toHaveProperty('error2', circularReference.value);
    expect(result).toStrictEqual(expected);
  });
});
