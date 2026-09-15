import { useContact } from './ContactContext';

export default function FloatingWhatsApp() {
  const { whatsapp } = useContact();

  return (
    <a
      className="floating-whatsapp"
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
        <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" aria-hidden="true" />
    </a>
  );
}
