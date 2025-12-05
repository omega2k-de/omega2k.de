import { MixedBooleanType } from '../interfaces';

export const isTrue: (value: MixedBooleanType) => boolean = (value: MixedBooleanType): boolean =>
  value === true || value === 'true' || value === '1';
