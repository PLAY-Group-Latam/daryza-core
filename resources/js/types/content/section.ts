export interface PageInfo {
  slug: string;
  title?: string;
}

export interface SectionBase {
  id:         number;
  name:       string;
  type:       string;
  sort_order?: number;
  is_active?:  boolean;
  page:       PageInfo;
}