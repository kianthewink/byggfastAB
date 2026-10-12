import type { FaqCategory } from "@/lib/types";

/** Vanliga frågor grupperade per ämne på sidan "Bra att veta". */
export const faqCategories: FaqCategory[] = [
  {
    id: "ko-och-ansokan",
    title: "Kö och ansökan",
    items: [
      {
        question: "Hur ställer jag mig i bostadskö hos BOFAST?",
        answer:
          "Du registrerar dig kostnadsfritt på Mina sidor. När kontot är skapat samlar du köpoäng för varje dag du står i kön och kan anmäla intresse för de lägenheter som är lediga.",
      },
      {
        question: "Vilka krav ställer ni på mig som hyresgäst?",
        answer:
          "Du ska ha en stabil inkomst som täcker hyran, sköta tidigare boenden utan betalningsanmärkningar och kunna visa upp giltig legitimation. Vi tar alltid en kreditupplysning innan kontrakt skrivs.",
      },
      {
        question: "Hur får jag veta att jag blivit erbjuden en lägenhet?",
        answer:
          "Vi kontaktar dig via e-post och telefon. Du har normalt tre vardagar på dig att tacka ja eller nej, och du behåller dina köpoäng om du tackar nej.",
      },
      {
        question: "Kan jag ställa mig i kö om jag är under 18 år?",
        answer:
          "Du kan registrera dig från det år du fyller 17, men kontrakt tecknas tidigast när du fyllt 18 år.",
      },
    ],
  },
  {
    id: "hyra-och-betalning",
    title: "Hyra och betalning",
    items: [
      {
        question: "När ska hyran vara betald?",
        answer:
          "Hyran betalas i förskott och ska vara bokförd på vårt konto senast den sista vardagen i månaden innan hyresmånaden. Betalar du för sent tillkommer påminnelseavgift och dröjsmålsränta.",
      },
      {
        question: "Kan jag betala med autogiro eller e-faktura?",
        answer:
          "Ja. Både autogiro och e-faktura anmäler du enkelt via din internetbank – sök på BOFAST AB och ange ditt kundnummer som referens.",
      },
      {
        question: "Vad ingår i hyran?",
        answer:
          "I de flesta av våra lägenheter ingår värme, vatten och sophantering. El, bredband och eventuell parkeringsplats tecknas separat. Vad som gäller för just ditt boende står i ditt hyreskontrakt.",
      },
      {
        question: "Hur ofta höjs hyran?",
        answer:
          "Hyran förhandlas årligen med Hyresgästföreningen. Vi informerar alltid skriftligt innan en ny hyra börjar gälla.",
      },
    ],
  },
  {
    id: "ditt-boende",
    title: "Ditt boende",
    items: [
      {
        question: "Får jag måla om eller tapetsera själv?",
        answer:
          "Mindre förändringar i normala färger är tillåtna, men arbetet ska utföras fackmässigt. Vid utflytt kan du bli ersättningsskyldig om lägenheten återställs i ett skick som avviker från normalt slitage. Kontakta oss gärna innan du börjar.",
      },
      {
        question: "Vilka regler gäller för ombyggnad, till exempel nytt kök?",
        answer:
          "Alla fasta installationer och ingrepp i lägenheten kräver skriftligt tillstånd från oss. Kontakta kontoret i god tid så går vi igenom vad som är möjligt.",
      },
      {
        question: "När ska det vara tyst i huset?",
        answer:
          "Vi tillämpar tyst tid mellan klockan 22.00 och 07.00. Ska du ha fest eller borra i väggarna – sätt gärna upp en lapp i trapphuset i förväg.",
      },
      {
        question: "Får jag ha husdjur?",
        answer:
          "Ja, husdjur är välkomna i våra lägenheter så länge de inte stör grannarna eller orsakar skador. Djur får inte rastas på gården.",
      },
      {
        question: "Hur sorterar jag mina sopor?",
        answer:
          "I anslutning till varje fastighet finns kärl för restavfall och matavfall. Förpackningar, tidningar och glas lämnas på närmaste återvinningsstation, och grovsopor kör du själv till kommunens återvinningscentral.",
      },
    ],
  },
  {
    id: "flytt-och-uppsagning",
    title: "Flytt och uppsägning",
    items: [
      {
        question: "Hur säger jag upp mitt hyreskontrakt?",
        answer:
          "Uppsägningen ska vara skriftlig och undertecknad av samtliga kontraktsinnehavare. Du kan lämna den på kontoret, skicka den med post eller signera digitalt på Mina sidor.",
      },
      {
        question: "Hur lång är uppsägningstiden?",
        answer:
          "Tre kalendermånader räknat från nästkommande månadsskifte. Säger du upp lägenheten den 10 mars gäller kontraktet alltså till och med den 30 juni.",
      },
      {
        question: "Vad händer vid besiktningen?",
        answer:
          "Innan du flyttar ut går vi tillsammans igenom lägenheten och noterar eventuella skador utöver normalt slitage. Du får protokollet skriftligt och har möjlighet att åtgärda anmärkningar före avflyttning.",
      },
      {
        question: "Kan jag byta lägenhet med någon annan?",
        answer:
          "Direktbyte kan godkännas om båda parter har beaktansvärda skäl och den nya hyresgästen uppfyller våra krav. Ansökan görs skriftligt av båda hushållen och handläggs inom cirka fyra veckor.",
      },
    ],
  },
];
