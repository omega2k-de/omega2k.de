import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { MockProvider } from 'ng-mocks';
import { provideConfig } from '../tokens';
import { SeoService } from './seo.service';
import { Link } from '@grandgular/link';
import { ORIGIN } from '../tokens';

describe('SeoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        provideConfig({ logger: 'OFF' }),
        {
          provide: ORIGIN,
          useValue: 'https://origin:4711',
        },
        MockProvider(Title),
        MockProvider(Link),
        MockProvider(Meta),
      ],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(SeoService);
    expect(service).toBeTruthy();
  });

  it('#updateMetaInfo should update given data', () => {
    const service = TestBed.inject(SeoService);
    const titleSpy = vi.spyOn(service['title'], 'setTitle');
    const updateTagSpy = vi.spyOn(service['meta'], 'updateTag');

    service.updateMetaInfo({
      title: 'title text',
      description: 'description text',
      keywords: 'keyword1 keyword2',
      author: 'author name',
    });

    expect(titleSpy).toHaveBeenCalledExactlyOnceWith('title text');
    expect(updateTagSpy).toHaveBeenCalledTimes(12);
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      1,
      {
        content: 'description text',
        name: 'description',
      },
      "name='description'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      2,
      {
        content: 'author name',
        name: 'author',
      },
      "name='author'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      3,
      {
        content: 'keyword1 keyword2',
        name: 'keywords',
      },
      "name='keywords'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      4,
      {
        content: 'summary',
        name: 'twitter:card',
      },
      "name='twitter:card'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      5,
      {
        content: 'title text',
        name: 'twitter:title',
      },
      "name='twitter:title'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      6,
      {
        content: 'description text',
        name: 'twitter:description',
      },
      "name='twitter:description'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      7,
      {
        content: '@xn__2k_dcc',
        name: 'twitter:site',
      },
      "name='twitter:site'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      8,
      {
        content: '@xn__2k_dcc',
        name: 'twitter:creator',
      },
      "name='twitter:creator'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      9,
      {
        content: 'article',
        property: 'og:type',
      },
      "property='og:type'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      10,
      {
        content: 'title text',
        property: 'og:title',
      },
      "property='og:title'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      11,
      {
        content: 'description text',
        property: 'og:description',
      },
      "property='og:description'"
    );
  });

  it('#updateMetaInfo should set only given data and remove others', () => {
    const service = TestBed.inject(SeoService);
    service.updateMetaInfo({
      title: 'title text',
      description: 'description text',
      keywords: 'keyword1 keyword2',
      author: 'author name',
    });

    const titleSpy = vi.spyOn(service['title'], 'setTitle');
    const updateTagSpy = vi.spyOn(service['meta'], 'updateTag');
    const removeTagSpy = vi.spyOn(service['meta'], 'removeTag');

    service.updateMetaInfo({
      description: 'new description text',
    });

    expect(titleSpy).toHaveBeenCalledExactlyOnceWith('');
    expect(updateTagSpy).toHaveBeenCalledTimes(8);
    expect(removeTagSpy).toHaveBeenCalledTimes(18);
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      1,
      {
        content: 'new description text',
        name: 'description',
      },
      "name='description'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      2,
      {
        content: 'summary',
        name: 'twitter:card',
      },
      "name='twitter:card'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      3,
      {
        content: 'new description text',
        name: 'twitter:description',
      },
      "name='twitter:description'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      4,
      {
        content: '@xn__2k_dcc',
        name: 'twitter:site',
      },
      "name='twitter:site'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      5,
      {
        content: '@xn__2k_dcc',
        name: 'twitter:creator',
      },
      "name='twitter:creator'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      6,
      {
        content: 'article',
        property: 'og:type',
      },
      "property='og:type'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      7,
      {
        content: 'new description text',
        property: 'og:description',
      },
      "property='og:description'"
    );
    expect(updateTagSpy).toHaveBeenNthCalledWith(
      8,
      {
        content: 'omega2k.de',
        property: 'og:site_name',
      },
      "property='og:site_name'"
    );
    expect(removeTagSpy).toHaveBeenNthCalledWith(1, `name='author'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(2, `name='keywords'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(3, `name='twitter:title'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(4, `name='twitter:player'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(5, `name='twitter:player:height'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(6, `name='twitter:player:width'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(7, `name='twitter:image'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(8, `name='twitter:image:height'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(9, `name='twitter:image:width'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(10, `name='twitter:image:alt'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(11, `property='og:title'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(12, `property='og:player'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(13, `property='og:player:height'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(14, `property='og:player:width'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(15, `property='og:image'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(16, `property='og:image:height'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(17, `property='og:image:width'`);
    expect(removeTagSpy).toHaveBeenNthCalledWith(18, `property='og:image:alt'`);
  });

  it('#updateCanonical should update canonical and twitter/open graph data', () => {
    const service = TestBed.inject(SeoService);
    const linkUpdateTagSpy = vi.spyOn(service['link'], 'updateTag');
    const metaUpdateTagSpy = vi.spyOn(service['meta'], 'updateTag');

    service.updateOriginLinks('/some/path(maybe:aux)?and=params&or=more#hash/foo');

    expect(metaUpdateTagSpy).toHaveBeenCalledTimes(1);
    expect(metaUpdateTagSpy).toHaveBeenNthCalledWith(
      1,
      {
        content: 'https://origin:4711/some/path',
        property: 'og:url',
      },
      "property='og:url'"
    );
    expect(linkUpdateTagSpy).toHaveBeenCalledTimes(2);
    expect(linkUpdateTagSpy).toHaveBeenNthCalledWith(1, {
      href: 'https://origin:4711',
      rel: 'preconnect',
    });
    expect(linkUpdateTagSpy).toHaveBeenNthCalledWith(2, {
      href: 'https://origin:4711/some/path',
      rel: 'canonical',
    });
  });
});
