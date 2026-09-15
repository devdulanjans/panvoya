import { createContext, useContext } from 'react';
import { DEFAULT_CONTACT } from '../lib/contactDefaults';

const ContactContext = createContext(DEFAULT_CONTACT);

export function ContactProvider({ value, children }) {
  return <ContactContext.Provider value={{ ...DEFAULT_CONTACT, ...value }}>{children}</ContactContext.Provider>;
}

export function useContact() {
  return useContext(ContactContext);
}
