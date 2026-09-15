import { createContext, useContext } from 'react';

const DEFAULT_FOOTER_LINKS = {
  topDestinations: [],
  popularSearches: [],
  resources: [],
  socialLinks: [],
};

const FooterLinksContext = createContext(DEFAULT_FOOTER_LINKS);

export function FooterLinksProvider({ value, children }) {
  return <FooterLinksContext.Provider value={{ ...DEFAULT_FOOTER_LINKS, ...value }}>{children}</FooterLinksContext.Provider>;
}

export function useFooterLinks() {
  return useContext(FooterLinksContext);
}
