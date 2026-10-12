import type { BuildCatalog, Municipality, PurchasePackage } from "./types";

/**
 * Starting data for kommuner, the Bygg online catalog and the purchase
 * packages. Used until something has been saved in the admin panel
 * (/administrator/bygg-online), and by "Återställ till exempeldata".
 *
 * The price factors are PLACEHOLDERS, deliberately spread out so a change
 * of kommun visibly changes every price while the feature is being tested.
 * Replace them — or enter exact prices per kommun — once real figures exist.
 */
export const DEFAULT_MUNICIPALITIES: Municipality[] = [
  { id: "hylte", name: "Hylte", priceFactor: 0.95 },
  { id: "gislaved", name: "Gislaved", priceFactor: 0.97 },
  { id: "gnosjo", name: "Gnosjö", priceFactor: 0.97 },
  { id: "vaggeryd", name: "Vaggeryd", priceFactor: 0.98 },
  { id: "ljungby", name: "Ljungby", priceFactor: 1 },
  { id: "varnamo", name: "Värnamo", priceFactor: 1 },
  { id: "svenljunga", name: "Svenljunga", priceFactor: 1.02 },
  { id: "tranemo", name: "Tranemo", priceFactor: 1.02 },
  { id: "falkenberg", name: "Falkenberg", priceFactor: 1.04 },
  { id: "halmstad", name: "Halmstad", priceFactor: 1.06 },
  { id: "jonkoping", name: "Jönköping", priceFactor: 1.08 },
  { id: "goteborg", name: "Göteborg", priceFactor: 1.15 },
  { id: "malmo", name: "Malmö", priceFactor: 1.15 },
  { id: "stockholm", name: "Stockholm", priceFactor: 1.25 },
];

const CAMPAIGN = "Spara upp till 100 000 kr i okt";

/** Placeholder packages for products that have none of their own yet. */
export const DEFAULT_PACKAGES: PurchasePackage[] = [
  {
    id: "nyckelfardig-entreprenad",
    name: "Nyckelfärdig Modul + Entreprenad",
    description:
      "Vi levererar huset nyckelfärdigt och tar hand om hela entreprenaden — grund, montering och alla inkopplingar. Du flyttar in.",
    campaign: CAMPAIGN,
    price: 3890605,
    configurable: true,
    exactPrices: {},
  },
  {
    id: "nyckelfardig",
    name: "Nyckelfärdig Modul",
    description:
      "Huset levereras färdigställt invändigt och utvändigt. Grund och inkopplingar ordnar du själv eller via egen entreprenör.",
    campaign: CAMPAIGN,
    price: 3305610,
    configurable: true,
    exactPrices: {},
  },
  {
    id: "klimatskal",
    name: "Klimatskal Modul",
    description:
      "Ett tätt och isolerat skal med tak, fasad, fönster och dörrar. Invändigt färdigställande sköter du själv.",
    campaign: CAMPAIGN,
    price: 2369610,
    configurable: true,
    exactPrices: {},
  },
  {
    id: "prefab-stomme",
    name: "Prefab Stomme",
    description:
      "Prefabricerade väggar och takstolar, klara att resa på plats. Passar dig som bygger mycket själv.",
    campaign: "",
    price: 1082900,
    configurable: false,
    exactPrices: {},
  },
  {
    id: "ritningspaket",
    name: "Ritningspaket (A-Ritning)",
    description:
      "Kompletta A-ritningar för bygglovsansökan. Priset dras av om du senare köper huset av oss.",
    campaign: "",
    price: 14000,
    configurable: false,
    exactPrices: {},
  },
];

function option(
  id: string,
  name: string,
  price = 0,
  extra: { swatch?: string; description?: string } = {}
) {
  return {
    id,
    name,
    price,
    description: extra.description ?? "",
    swatch: extra.swatch ?? null,
    exactPrices: {},
  };
}

export const DEFAULT_CATALOG: BuildCatalog = {
  groups: [
    {
      id: "exterior",
      name: "Exteriör",
      categories: [
        {
          id: "planlosning",
          name: "Standard eller spegelvänd planlösning",
          description: "Spegelvänd planlösning vänder huset åt andra hållet.",
          multiple: false,
          options: [
            option("standard-planlosning", "Standard planlösning"),
            option("spegelvand-planlosning", "Spegelvänd planlösning"),
          ],
        },
        {
          id: "fasadstruktur",
          name: "Fasadstruktur",
          description: "",
          multiple: false,
          options: [
            option("staende-panel", "Stående panel"),
            option("liggande-panel", "Liggande panel", 3995),
            option("lockslaktpanel", "Locksläktpanel", 88995),
            option("modern-staende-panel", "Modern stående panel", 125095),
          ],
        },
        {
          id: "fasadfarg",
          name: "Fasadfärg",
          description: "",
          multiple: false,
          options: [
            option("vit-fasad", "Vit", 0, { swatch: "#f4f3ee" }),
            option("svart-fasad", "Svart", 21995, { swatch: "#1f1f1f" }),
            option("gra-fasad", "Grå", 21995, { swatch: "#8a8d8f" }),
            option("falurod-fasad", "Faluröd", 21995, { swatch: "#8b2e22" }),
          ],
        },
        {
          id: "tak",
          name: "Tak",
          description: "",
          multiple: false,
          options: [
            option("plattak-svart", "Plåttak svart", 0, { swatch: "#262626" }),
            option("plattak-gra", "Plåttak grå", 0, { swatch: "#6f7275" }),
            option("plattak-rod", "Plåttak röd", 4995, { swatch: "#7a2a22" }),
          ],
        },
        {
          id: "fonster",
          name: "Fönster och dörrar",
          description: "",
          multiple: false,
          options: [
            option("vita-fonster", "Vita fönster", 0, { swatch: "#ffffff" }),
            option("svarta-fonster", "Svarta fönster", 14995, { swatch: "#1f1f1f" }),
            option("glasparti", "Svarta fönster + glasparti", 39995, {
              swatch: "#1f1f1f",
            }),
          ],
        },
      ],
    },
    {
      id: "interior",
      name: "Interiör",
      categories: [
        {
          id: "golv",
          name: "Golv",
          description: "",
          multiple: false,
          options: [
            option("laminat-ek", "Laminat ek"),
            option("parkett-ek", "Parkett ek", 34995),
            option("klinker", "Klinker", 29995),
          ],
        },
        {
          id: "vaggar",
          name: "Innerväggar",
          description: "",
          multiple: false,
          options: [
            option("vitmalade", "Vitmålade väggar"),
            option("panelvaggar", "Vitlaserad panel", 24995),
          ],
        },
        {
          id: "innerdorrar",
          name: "Innerdörrar",
          description: "",
          multiple: false,
          options: [
            option("slata-dorrar", "Vita släta dörrar"),
            option("sparade-dorrar", "Vita spårade dörrar", 9995),
          ],
        },
      ],
    },
    {
      id: "kok",
      name: "Kök",
      categories: [
        {
          id: "kokluckor",
          name: "Köksluckor",
          description: "",
          multiple: false,
          options: [
            option("vita-luckor", "Vita släta luckor", 0, { swatch: "#f7f7f5" }),
            option("grona-luckor", "Gröna luckor", 14995, { swatch: "#4f6b55" }),
            option("ek-luckor", "Luckor i ek", 22995, { swatch: "#b08a5a" }),
          ],
        },
        {
          id: "bankskiva",
          name: "Bänkskiva",
          description: "",
          multiple: false,
          options: [
            option("laminat-bankskiva", "Laminat"),
            option("komposit-bankskiva", "Komposit", 19995),
          ],
        },
        {
          id: "vitvaror",
          name: "Vitvaror",
          description: "",
          multiple: false,
          options: [
            option("vita-vitvaror", "Vita vitvaror"),
            option("rostfria-vitvaror", "Rostfria vitvaror", 12995),
          ],
        },
      ],
    },
    {
      id: "wcd",
      name: "WC/D",
      categories: [
        {
          id: "kakel",
          name: "Kakel",
          description: "",
          multiple: false,
          options: [
            option("vitt-kakel", "Vit blank 25 × 40 cm", 0, { swatch: "#ffffff" }),
            option("gratt-kakel", "Grå matt 30 × 60 cm", 6995, { swatch: "#9a9b9d" }),
          ],
        },
        {
          id: "dusch",
          name: "Dusch",
          description: "",
          multiple: false,
          options: [
            option("duschdraperi", "Duschdraperi"),
            option("duschvaggar", "Duschväggar i glas", 8995),
          ],
        },
      ],
    },
    {
      id: "tillval",
      name: "Tillval",
      categories: [
        {
          id: "tillval",
          name: "Tillval",
          description: "Välj så många du vill.",
          multiple: true,
          options: [
            option("luftvarmepump", "Luftvärmepump", 24995),
            option("golvvarme", "Vattenburen golvvärme", 39995),
            option("altan", "Altan 18 m²", 49995),
            option("forrad", "Förråd 10 m²", 29995),
            option("solceller", "Solceller 5 kW", 89995),
          ],
        },
      ],
    },
  ],
};
