import hash, { NotUndefined } from 'object-hash';
import { v4 as uuidV4 } from 'uuid';

export class ObjectHelper {
  public static hasSameHash<T = NotUndefined>(obj1?: T, obj2?: T): boolean {
    if (obj1 === obj2) {
      return true;
    }

    if (typeof obj1 === 'undefined' || typeof obj2 === 'undefined') {
      return obj1 === obj2;
    }

    if (obj1 === null || obj2 === null) {
      return obj1 === obj2;
    }

    return (
      hash(obj1 as NotUndefined, { ignoreUnknown: true }) ===
      hash(obj2 as NotUndefined, { ignoreUnknown: true })
    );
  }

  public static isEqual<T = unknown>(obj1: T, obj2: T, strict = true): boolean {
    if (strict && obj1 === obj2) {
      return true;
    }
    // eslint-disable-next-line eqeqeq
    if (!strict && obj1 == obj2) {
      return true;
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }
    if (obj1 === null || obj2 === null) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    return keys1
      .map(key => {
        const val1 = (obj1 as { [key: string]: unknown })[key];
        const val2 = (obj2 as { [key: string]: unknown })[key];
        return !(!keys2.includes(key) || !ObjectHelper.isEqual(val1, val2, strict));
      })
      .every(val => val);
  }

  public static getStringProperty<T>(path: string, obj: T): string {
    const arr = path.split('.');
    let pointer: T | NotUndefined = obj;
    while (arr.length) {
      const key = arr.shift() as keyof (T | NotUndefined);
      if (key && pointer) {
        if (typeof pointer === 'object' && key in pointer) {
          if (typeof pointer[key] === 'undefined' || pointer[key] === null) {
            throw new Error(`${path} path not found in object`);
          } else {
            pointer = pointer[key];
          }
        } else {
          throw new Error(`${path} path not found in object`);
        }
      } else {
        throw new Error(`${path} path not found in object`);
      }
    }

    return String(pointer);
  }

  public static jsonStringifyReplacerKeysOnly: <T = unknown>(
    key: keyof T,
    value: T
  ) => (T & object) | never[] | null = <T = unknown>(
    _key: keyof T,
    value: T
  ): (T & object) | never[] | null => {
    if (typeof value === 'object') {
      return Array.isArray(value) ? [] : value;
    }
    return null;
  };

  public static keysHash<T extends object>(obj: T): string {
    const keys = JSON.stringify(obj, ObjectHelper.jsonStringifyReplacerKeysOnly);
    return hash(keys, { ignoreUnknown: true });
  }

  public static randomId = (length = 8) =>
    hash([new Date(), performance.now(), uuidV4().toString()], { encoding: 'hex' }).substring(
      0,
      length
    );
}
