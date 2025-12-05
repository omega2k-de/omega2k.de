import { inject, Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { SeoMetaDataInterface } from '../interfaces';
import { Link } from '@grandgular/link';
import { ORIGIN } from '../tokens';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly defaultCreator = '@xn__2k_dcc';
  private readonly origin = inject(ORIGIN);
  private readonly title = inject(Title);
  private readonly link = inject(Link);
  private readonly meta = inject(Meta);

  private metaDataSubject = new BehaviorSubject<SeoMetaDataInterface>({});
  readonly metaData$ = this.metaDataSubject.asObservable().pipe(untilDestroyed(this));

  updateMetaInfo({ description, author, keywords, title, twitter }: SeoMetaDataInterface) {
    this.title.setTitle(typeof title === 'string' ? title : '');
    this.updateMetaTags({ description, author, keywords });
    this.updateTwitterTags({ description, title, twitter });
    this.updateOpenGraphTags({ description, title, twitter });
    this.metaDataSubject.next({ description, author, keywords, title, twitter });
  }

  updateOriginLinks(path: string) {
    const url = new URL(`${this.origin}${path}`.replace(/\/?\([^)]+\).*$/gi, ''));
    const href = `${url.origin}${url.pathname}`;
    this.update('og', 'url', href);
    this.link.updateTag({ rel: 'preconnect', href: this.origin });
    this.link.updateTag({ rel: 'canonical', href });
  }

  private update(prefix: 'og' | 'twitter', name: string, content?: string) {
    const data: MetaDefinition =
      prefix === 'og' ? { property: `${prefix}:${name}` } : { name: `${prefix}:${name}` };
    if (content) {
      data.content = content;
    }
    this.updateTag(data);
  }

  private updateTag(metaDefinition: MetaDefinition): void {
    const selector = metaDefinition.name
      ? `name='${metaDefinition.name}'`
      : `property='${metaDefinition.property}'`;
    if (typeof metaDefinition.content === 'string' && metaDefinition.content.length > 0) {
      this.meta.updateTag(metaDefinition, selector);
    } else {
      this.meta.removeTag(selector);
    }
  }

  private updateMetaTags(data: Pick<SeoMetaDataInterface, 'description' | 'author' | 'keywords'>) {
    this.setMeta('description', this.truncOrUndef(200, data.description));
    this.setMeta('author', data.author);
    this.setMeta('keywords', data.keywords);
  }

  private truncOrUndef(maxLength: number, str?: string): string | undefined {
    if (typeof str === 'string') {
      return str.length > maxLength ? `${str.substring(0, maxLength - 1)}…` : str;
    }
    return undefined;
  }

  private addOriginOrUndefined(path?: string): string | undefined {
    return path ? `${this.origin}${path}` : undefined;
  }

  private updateTwitterTags(data: Pick<SeoMetaDataInterface, 'description' | 'title' | 'twitter'>) {
    const t = data.twitter ?? {};
    const card = t.card ?? (t.image?.url ? 'summary_large_image' : 'summary');

    this.update('twitter', 'card', card);
    this.update('twitter', 'title', this.truncOrUndef(70, t.title ?? data.title));
    this.update(
      'twitter',
      'description',
      this.truncOrUndef(160, t.description ?? data.description)
    );
    this.update('twitter', 'player', this.addOriginOrUndefined(t.player?.url));
    this.update('twitter', 'player:height', t.player?.height);
    this.update('twitter', 'player:width', t.player?.width);
    this.update('twitter', 'image', this.addOriginOrUndefined(t.image?.url));
    this.update('twitter', 'image:height', t.image?.height);
    this.update('twitter', 'image:width', t.image?.width);
    this.update('twitter', 'image:alt', this.truncOrUndef(420, t.image?.alt));
    this.update('twitter', 'site', t.site ?? this.defaultCreator);
    this.update('twitter', 'creator', t.creator ?? this.defaultCreator);
  }

  private setMeta(name: string, content?: string) {
    const data: MetaDefinition = { name };
    if (content) {
      data.content = content;
    }
    this.updateTag(data);
  }

  private updateOpenGraphTags(
    data: Pick<SeoMetaDataInterface, 'description' | 'title' | 'twitter'>
  ) {
    const t = data.twitter ?? {};

    this.update('og', 'type', 'article');
    this.update('og', 'title', this.truncOrUndef(70, t.title ?? data.title));
    this.update('og', 'description', this.truncOrUndef(160, t.description ?? data.description));
    this.update('og', 'player', this.addOriginOrUndefined(t.player?.url));
    this.update('og', 'player:height', t.player?.height);
    this.update('og', 'player:width', t.player?.width);
    this.update('og', 'image', this.addOriginOrUndefined(t.image?.url));
    this.update('og', 'image:height', t.image?.height);
    this.update('og', 'image:width', t.image?.width);
    this.update('og', 'image:alt', this.truncOrUndef(420, t.image?.alt));
    this.update('og', 'site_name', 'omega2k.de');
  }
}
