import type { InfoCard } from "@/lib/types";

/** Korta informationskort högst upp på sidan "Bra att veta". */
export const practicalInfo: InfoCard[] = [
  {
    id: "felanmalan",
    icon: "wrench",
    title: "Felanmälan",
    description:
      "Gör din felanmälan dygnet runt via Mina sidor. Beskriv felet så utförligt du kan – då kan vår fastighetsskötare ta med rätt verktyg direkt. Vid akuta fel utanför kontorstid ringer du jouren.",
    href: "/felanmalan",
    cta: "Gör en felanmälan...",
  },
  {
    id: "hyra",
    icon: "mail",
    title: "Hyra och avier",
    description:
      "Hyran betalas i förskott och ska vara oss tillhanda senast den sista vardagen i månaden före hyresmånaden. Avierna skickas kvartalsvis, och du kan välja e-faktura eller autogiro via din internetbank.",
  },
  {
    id: "uppsagning",
    icon: "check",
    title: "Uppsägning och flytt",
    description:
      "Uppsägningstiden är tre kalendermånader och räknas från månadsskiftet efter att vi tagit emot din skriftliga uppsägning. Lägenheten visas för nya sökande under uppsägningstiden.",
  },
  {
    id: "forsakring",
    icon: "shield",
    title: "Hemförsäkring",
    description:
      "Du måste ha en giltig hemförsäkring under hela hyrestiden. Den täcker dina saker vid brand, inbrott och vattenskada – vår fastighetsförsäkring gäller bara byggnaden.",
  },
  {
    id: "nycklar",
    icon: "lock",
    title: "Nycklar och lås",
    description:
      "Nycklar kvitteras ut på vårt kontor på tillträdesdagen och lämnas tillbaka senast klockan 12.00 dagen efter att kontraktet upphört. Tappad nyckel anmäls direkt till oss.",
  },
  {
    id: "jour",
    icon: "phone",
    title: "Jour och akuta fel",
    description:
      "Vid vattenläckage, stopp i avlopp, strömavbrott eller andra fel som inte kan vänta till nästa vardag når du fastighetsjouren dygnet runt. Jourutryckning för icke-akuta ärenden debiteras hyresgästen.",
  },
];
