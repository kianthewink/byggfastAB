/** Company-wide static content: contact details and opening hours. */

export const site = {
  name: "BOFAST",
  fullName: "BOFAST AB",
  tagline: "Attefallshus",
  address: {
    street: "Bruksgatan 2",
    zip: "314 31",
    city: "Hyltebruk",
    phone: "0345-408 40",
  },
  openingHours: [
    { days: "Måndag – Torsdag", hours: "07.30 – 16.30" },
    { days: "Fredag", hours: "08.00 – 14.00" },
    { days: "Lunchstängt", hours: "12.00 – 12.30" },
  ],
  footerLinks: [
    { label: "Kontakta oss", href: "/om-oss/kontakt" },
    { label: "Cookies", href: "/bra-att-veta/cookies" },
  ],
} as const;
