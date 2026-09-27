import { company, navigation } from './data/lca/site';
export const headerData = {
  links: navigation.map(({ label, href }) => ({ text: label, href })),
  actions: [{ text: 'Hablemos', href: '/#contacto' }],
};
export const footerData = {
  links: [{ title: 'LCA Technology Solutions', links: navigation.map(({ label, href }) => ({ text: label, href })) }],
  secondaryLinks: [
    { text: 'Aviso legal', href: '/aviso-legal' },
    { text: 'Privacidad', href: '/privacidad' },
    { text: 'Cookies', href: '/cookies' },
  ],
  socialLinks: [{ ariaLabel: 'LinkedIn de LCA', icon: 'tabler:brand-linkedin', href: company.linkedin }],
  footNote: `© ${new Date().getFullYear()} LCA Technology Solutions`,
};
