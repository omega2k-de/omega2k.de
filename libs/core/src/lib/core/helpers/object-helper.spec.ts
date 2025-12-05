import { ArrayHelper, ObjectHelper } from '.';

describe('ObjectHelper', () => {
  let service: ObjectHelper;

  const obj1 = { a: 1, b: 'string', c: true };
  const obj2 = { a: 1, b: 'string', c: true };
  const obj3 = { a: 1, b: 'different', c: true };
  const obj4 = { a: 1, b: 'string' };
  const obj5 = null;
  const obj6 = undefined;

  beforeEach(() => {
    service = new ObjectHelper();
  });

  it('should create an instance', () => {
    expect(service).toBeInstanceOf(ObjectHelper);
  });

  describe('#randomId should produce unique ids', () => {
    test.each([{ length: 8 }, { length: 16 }, { length: 32 }])(
      '$length throw errors',
      ({ length }: { length: number }) => {
        const ids = new Array(100).fill(0).map(() => ({ hash: ObjectHelper.randomId(length) }));
        ids.forEach(id => expect(id.hash.length).toStrictEqual(length));
        expect(ArrayHelper.duplicateKeys(ids, 'hash').length).toStrictEqual(0);
      }
    );
  });

  describe('#hasSameHash', () => {
    it('should return true for equal objects', () => {
      expect(ObjectHelper.hasSameHash(obj1, obj1)).toBe(true);
    });

    it('should return true for objects with the same hash', () => {
      expect(ObjectHelper.hasSameHash(obj1, obj2)).toBe(true);
    });

    it('should return false for objects with different hashes', () => {
      expect(ObjectHelper.hasSameHash(obj1, obj3)).toBe(false);
    });

    it('should handle null and undefined correctly', () => {
      expect(ObjectHelper.hasSameHash(obj5, obj6)).toBe(false);
    });

    it('should handle null and other correctly', () => {
      expect(ObjectHelper.hasSameHash(obj5, obj3)).toBe(false);
    });

    it('should handle undefined and undefined correctly', () => {
      expect(ObjectHelper.hasSameHash(obj6, obj3)).toBe(false);
    });
  });

  describe('#isEqual', () => {
    const testSets = [
      {
        name: 'equal primitives',
        expected: true,
        a: 'test',
        b: 'test',
      },
      {
        name: 'equal objects',
        expected: true,
        a: {
          foo: undefined,
          someProp: true,
          sub: {
            prop: 'A',
            date: new Date(123456789),
          },
          otherProp: 1337,
        },
        b: {
          sub: {
            date: new Date(123456789),
            prop: 'A',
          },
          otherProp: 1337,
          foo: undefined,
          someProp: true,
        },
      },
      {
        name: 'not equal by prop list length',
        expected: false,
        a: {
          otherProp: 1337,
        },
        b: {
          otherProp: 1337,
          foo: undefined,
          someProp: true,
        },
      },
      {
        name: 'not equal by null value',
        expected: false,
        a: {
          otherProp: 1337,
          foo: null,
        },
        b: {
          otherProp: 1337,
          foo: {},
        },
      },
      {
        name: 'not equal by sub property',
        expected: false,
        a: {
          someProp: true,
          otherProp: 1337,
          sub: {
            prop: 'A',
            date: new Date(123456789),
          },
        },
        b: {
          sub: {
            prop: 'A',
            date: 123456789,
          },
          otherProp: 1337,
          someProp: true,
        },
      },
    ];

    test.each(testSets)('$name', ({ expected, a, b }) => {
      expect(ObjectHelper.isEqual<unknown>(a, b)).toEqual(expected);
    });

    test.each(testSets)('$name not strict', ({ expected, a, b }) => {
      expect(ObjectHelper.isEqual<unknown>(a, b, false)).toEqual(expected);
    });

    it('should return true for deeply equal objects with strict comparison', () => {
      expect(ObjectHelper.isEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for objects with different values with strict comparison', () => {
      expect(ObjectHelper.isEqual(obj1, obj3)).toBe(false);
    });

    it('should return false for objects with different keys with strict comparison', () => {
      expect(ObjectHelper.isEqual(obj1, obj4)).toBe(false);
    });

    it('should return false for non-object values with strict comparison', () => {
      expect(ObjectHelper.isEqual(1, '1' as unknown)).toBe(false);
    });

    it('should return true for non-strict comparison of loosely equal values', () => {
      expect(ObjectHelper.isEqual(1, '1' as unknown, false)).toBe(true);
    });

    it('should return false for non-strict comparison of different values', () => {
      expect(ObjectHelper.isEqual(1, '2' as unknown, false)).toBe(false);
    });

    it('should handle null and undefined correctly', () => {
      expect(ObjectHelper.isEqual(obj5, obj6)).toBe(false);
    });

    it('should handle deep nested objects correctly', () => {
      const deepObj1 = { a: { b: { c: 1 } } };
      const deepObj2 = { a: { b: { c: 1 } } };
      const deepObj3 = { a: { b: { c: 2 } } };

      expect(ObjectHelper.isEqual(deepObj1, deepObj2)).toBe(true);
      expect(ObjectHelper.isEqual(deepObj1, deepObj3)).toBe(false);
    });
  });

  describe('should return string properties of object', () => {
    const obj = {
      test: {
        foo: 'bar',
        null: null,
        undef: undefined,
        test: true,
        bar: 1,
        sub: {
          data: 3455.66,
          test: {
            deep: true,
          },
        },
      },
    };

    test.each([
      { path: 'test.foo', expected: 'bar' },
      { path: 'test.test', expected: 'true' },
      { path: 'test.bar', expected: '1' },
      { path: 'test.sub.data', expected: '3455.66' },
      { path: 'test.sub.test.deep', expected: 'true' },
    ])(
      '$path should return $expected',
      ({ path, expected }: { path: string; expected: string | null }) => {
        expect(ObjectHelper.getStringProperty(path, obj)).toStrictEqual(expected);
      }
    );

    test.each([
      { path: 'test.null' },
      { path: 'test.null' },
      { path: 'test.test.isBool' },
      { path: 'test.bar.not-possible' },
      { path: 'test.undef' },
      { path: 'test.not.existing.property' },
    ])('$path throw errors', ({ path }: { path: string }) => {
      expect(() => ObjectHelper.getStringProperty(path, obj)).toThrow(
        `${path} path not found in object`
      );
    });

    it('should throw errors on null object', () => {
      expect(() => ObjectHelper.getStringProperty('some.path', null)).toThrow(
        `some.path path not found in object`
      );
    });

    test.each([
      {
        obj: {
          key: 'value',
        },
        result: 'd4d7effb1fbdd7021c6f044f0b2a8c097249525d',
      },
      {
        obj: {
          key: 'value',
          test: 'value2',
        },
        result: '26431ea34dde3919414ec23c89dc79b08e647c78',
      },
      {
        obj: {
          key: 'value',
          sub: {
            arr: [],
            data: 'value2',
          },
          test: 'value2',
        },
        result: 'd7cc64a9b960d7ecb5000c3da86d54e4e247a87e',
      },
      {
        obj: {
          key: 'value',
          sub: {
            arr: [],
            data: 'other1',
          },
          test: 'value2',
        },
        result: 'd7cc64a9b960d7ecb5000c3da86d54e4e247a87e',
      },
      {
        obj: {
          key: 'value',
          sub: {
            arr: [
              {
                sub: 'v1',
                test: false,
              },
            ],
            data: null,
          },
          test: undefined,
        },
        result: 'd7cc64a9b960d7ecb5000c3da86d54e4e247a87e',
      },
    ])(
      '#keysHash $obj return correct result: $result',
      ({ obj, result }: { obj: object; result: string }) => {
        expect(ObjectHelper.keysHash(obj)).toStrictEqual(result);
      }
    );
  });
});
