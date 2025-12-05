import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SeoService } from '../services';
import { PageRecordInterface, SeoMetaDataInterface } from '../interfaces';

@Injectable()
export class SeoStrategy extends TitleStrategy {
  private readonly seoService = inject(SeoService);

  updateTitle(snapshot: RouterStateSnapshot): void {
    const activatedSnapshot = this.mapFirstChild(snapshot.root);
    const data: SeoMetaDataInterface = activatedSnapshot.data;
    if (activatedSnapshot.data['page']) {
      this.updateSeoDataFromPage(activatedSnapshot, data);
    }

    this.seoService.updateOriginLinks(snapshot.url);
    this.seoService.updateMetaInfo(data);
  }

  private updateSeoDataFromPage(
    activatedSnapshot: ActivatedRouteSnapshot,
    data: SeoMetaDataInterface
  ) {
    const pageData: PageRecordInterface = activatedSnapshot.data['page'];
    data.title = pageData.title ?? data.title;
    data.description = pageData.description ?? data.description;
    data.author = pageData.authorSlug ?? data.author;
    data.keywords = pageData.keywords ?? data.keywords;
    data.twitter = {
      title: pageData.ogTitle ?? data.twitter?.title,
      description: pageData.ogDescription ?? data.twitter?.description,
    };
    if (pageData.ogImage) {
      data.twitter = {
        image: {
          width: '1200',
          height: '600',
          url: pageData.ogImage,
          alt: pageData.ogDescription ?? data.twitter.description ?? '',
        },
      };
    }
  }

  private mapFirstChild(route: ActivatedRouteSnapshot) {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
