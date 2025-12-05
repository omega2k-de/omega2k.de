import { MetaDefinition } from '@angular/platform-browser';
import { Data, Route } from '@angular/router';

export type SeoRoutes = SeoRoute[];
export interface SeoRoute extends Route {
  data?: SeoMetaDataInterface;
  children?: SeoRoutes;
}

export interface SeoTwitterPlayerDataInterface {
  url: string;
  height: string;
  width: string;
}

export interface SeoTwitterImageDataInterface {
  url: string;
  alt: string;
  height?: string;
  width?: string;
}

export interface SeoTwitterCardInterface {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;
  description?: string;
  player?: SeoTwitterPlayerDataInterface;
  image?: SeoTwitterImageDataInterface;
  site?: string; // @handle
  creator?: string; // @handle
}

export interface SeoMetaDataInterface extends Data {
  title?: MetaDefinition['content'];
  description?: MetaDefinition['content'];
  author?: MetaDefinition['content'];
  keywords?: MetaDefinition['content'];
  twitter?: SeoTwitterCardInterface;
}
