import { Injectable } from '@angular/core';
import { DefaultUrlSerializer, UrlSegmentGroup, UrlSerializer, UrlTree } from '@angular/router';

@Injectable()
export class PrimaryOnlyUrlSerializer extends DefaultUrlSerializer implements UrlSerializer {
  override parse(url: string): UrlTree {
    const tree = super.parse(url);
    this.stripAuxOutlets(tree.root);
    return tree;
  }

  private stripAuxOutlets(group: UrlSegmentGroup): void {
    const children = group.children as { [key: string]: UrlSegmentGroup } | undefined;
    if (!children) return;

    const primary = children['primary'];
    const next: { [key: string]: UrlSegmentGroup } = {};
    if (primary) {
      this.stripAuxOutlets(primary);
      next['primary'] = primary;
    }

    group.children = next;
  }
}
