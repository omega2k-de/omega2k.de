export interface PageRecordTree {
  parent: Omit<PageRecordInterface, 'bodyMarkdown'> | null;
  page: Omit<PageRecordInterface, 'bodyMarkdown'>;
  children: PageRecordTree[];
}

export interface PageRecordInterface {
  id: number;
  slug: string;
  parent: string | null;
  topic: string | null;
  route: string;
  title: string;
  keywords: string;
  description: string | null;
  authorSlug: string | null;
  layout: string | null;
  version: number;
  readingTimeMin: number | null;
  bodyMarkdown?: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogImageWidth: string | null;
  ogImageHeight: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isPublished: boolean;
  isNew: boolean;
}

export interface NavItemInterface {
  id: number;
  location: string;
  label: string;
  route: string | null;
  parentId: number | null;
  orderIndex: number;
  icon: string | null;
}
