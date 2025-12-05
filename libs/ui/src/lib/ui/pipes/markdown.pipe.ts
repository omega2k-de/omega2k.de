import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {
  transform(value: unknown): string {
    if (typeof value !== 'string') {
      return '';
    }

    return marked(value, { async: false });
  }
}
