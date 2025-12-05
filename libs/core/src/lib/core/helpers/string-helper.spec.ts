import { StringHelper } from '.';

describe('StringHelper', () => {
  const weakPasswords = [
    'password',
    '123456',
    '12345678',
    '1234',
    'qwerty',
    '12345',
    'dragon',
    'pussy',
    'baseball',
    'football',
    'letmein',
    'monkey',
    '696969',
    'abc123',
    'mustang',
    'michael',
    'shadow',
    'master',
    'jennifer',
    '111111',
    '2000',
    'jordan',
    'superman',
    'harley',
    '1234567',
    'fuckme',
    'hunter',
    'fuckyou',
    'trustno1',
    'ranger',
    'buster',
    'thomas',
    'tigger',
    'robert',
    'soccer',
    'fuck',
    'batman',
    'test',
    'pass',
    'killer',
    'hockey',
    'george',
  ];
  let service: StringHelper;

  beforeEach(() => {
    service = new StringHelper();
  });

  it('should create an instance', () => {
    expect(service).toBeInstanceOf(StringHelper);
  });

  it('alpha numeric strings between 8 and 9 have an entropy less then 50', () => {
    for (let i = 0; i < 999; i++) {
      const str = i === 0 ? undefined : Math.round(Math.random() * 10e13).toString(36);
      expect(
        StringHelper.entropy(str),
        '9 random alphanumeric chars are a weak password'
      ).toBeLessThan(50);
    }
  });

  it('phrases make better passwords', () => {
    for (let i = 0; i < 999; i++) {
      const str = [
        Math.round(Math.random() * 10e13).toString(36),
        Math.round(Math.random() * 10e13).toString(36),
        Math.round(Math.random() * 10e13).toString(36),
      ].join(' ');
      expect(StringHelper.entropy(str), 'three "words" yield high entropy').toBeGreaterThan(100);
    }
  });

  it('the 42 most common passwords are weak', () => {
    for (const str of weakPasswords) {
      expect(StringHelper.entropy(str), "Yup, that's a weak password").lessThan(70);
    }
  });

  it('some random generated google chrome passwords', () => {
    for (const str of ['TTnE4GP7P9Q6PKP', 'MssivPiLQH9VAt6', '4zbhwMU3bAaRH3g']) {
      expect(StringHelper.entropy(str), "Hmmm, that's a semi secure password").greaterThan(85);
    }
  });

  it('use everything you can password', () => {
    expect(
      StringHelper.entropy(`1°2§FGmµµöÜÜ*'ÄÜ=I?\`ß34ßgbmmjüs_ds.üp,bn947j+üs,gmn  n,üal35`),
      'Nobody uses this'
    ).greaterThanOrEqual(400);
  });

  it('a supposedly strong passwords', () => {
    expect(StringHelper.entropy('correct horse battery staple'), 'xkcd is right').toBeGreaterThan(
      120
    );
  });
});
