import site from '../../content/config/site.json';

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export type SiteConfig = {
  name: string;
  tagline: string;
  productionUrl: string;
  primaryMenu: NavItem[];
  footerQuickLinks: { label: string; href: string }[];
  social: Record<string, string>;
  podcast: { name: string; platforms: Record<string, string> };
};

export const siteConfig = site as SiteConfig;

export function pageTitle(page: string): string {
  return page ? `${page} – ${siteConfig.name}` : `${siteConfig.name} – ${siteConfig.tagline}`;
}
