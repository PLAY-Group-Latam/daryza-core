import { FRONTEND_ROUTE_MAP } from '@/lib/routes/frontendRouteMap';

interface SectionFrontendLinkProps {
  type: string;
  productSlug?: string;
}

export function SectionFrontendLink({ type, productSlug }: SectionFrontendLinkProps) {
  const resolver = FRONTEND_ROUTE_MAP[type];

  if (!resolver) return null;

  const url = resolver(productSlug);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-muted-foreground hover:underline"
    >
      {url}
    </a>
  );
}