import type { SectionBase } from './section';
import type { AnyContent, SectionContentMap, SectionType } from './content-map';

export * from './content-types';
export * from './section';
export * from './content-map';

// ─── Props genérico (cuando no sabes el tipo exacto) ─────────
export interface ContentSectionProps {
  section: SectionBase & {
    content: {
      content: AnyContent;
    };
  };
}

// ─── Props tipado fuerte por sección (usa esto en cada editor) ─
export type TypedSectionProps<T extends SectionType> = {
  section: SectionBase & {
    type: T;
    content: {
      content: SectionContentMap[T];
    };
  };
};