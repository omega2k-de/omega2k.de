export type ParallaxAlign = 'left' | 'right';

export interface ParallaxConfig {
  src: string;
  srcset?: string;
  sizes?: string;
  alt?: string;
  align?: ParallaxAlign;
  intensity?: number;
  disableBelowWidth?: number;
}
