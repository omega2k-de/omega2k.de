export class JsonHelper {
  static replacer() {
    const seen = new WeakSet();
    return (_: unknown, v: unknown) => {
      if (v !== null && typeof v === 'object') {
        if (seen.has(v)) {
          return;
        }

        seen.add(v);

        if (!Array.isArray(v)) {
          const keys = Object.keys(v).sort();
          const clone: Record<string, unknown> = {};

          for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i] as keyof unknown;
            clone[key] = v[key];
          }

          return clone;
        }
      }
      return v;
    };
  }

  static stringify(value: unknown, space?: string | number): string {
    return JSON.stringify(value, JsonHelper.replacer(), space);
  }
}
