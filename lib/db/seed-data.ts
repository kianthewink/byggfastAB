import type { Listing } from "./schema";
import { PLACEHOLDER_SPECS } from "./placeholder-specs";

type BaseListing = Omit<Listing, keyof typeof PLACEHOLDER_SPECS>;

/** Seed data for `db:seed` and "reset to sample data". */
const BASE_LISTINGS: BaseListing[] = [
  {
    "id": "hyltebruk-bruksgatan-2a",
    "listingType": "attefallshus",
    "sourceCollection": "apartments",
    "city": "Hyltebruk",
    "rooms": 2,
    "area": 58,
    "areaMax": null,
    "rent": 6450,
    "available": "2026-09-01",
    "floor": 2,
    "floorsTotal": 3,
    "elevator": false,
    "buildYear": 1968,
    "description": "Ljus tvåa på gångavstånd från centrala Hyltebruk. Lägenheten har öppen planlösning mellan kök och vardagsrum samt eget förråd i källaren.\n\nKöket är utrustat med diskmaskin och gott om förvaring. Från vardagsrummet når du en solig balkong i västerläge, perfekt för kvällskaffet.",
    "images": [
      "https://picsum.photos/seed/apt-hyltebruk-1/800/600",
      "https://picsum.photos/seed/apt-hyltebruk-2/800/600",
      "https://picsum.photos/seed/apt-hyltebruk-3/800/600"
    ],
    "amenities": [
      "Balkong",
      "Diskmaskin",
      "Förråd",
      "Husdjur tillåtna"
    ],
    "viewings": [
      {
        "date": "Sön 9 aug",
        "time": "15:10–15:40"
      },
      {
        "date": "Mån 10 aug",
        "time": "19:00–19:20"
      }
    ],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "ljungby-storgatan-14",
    "listingType": "attefallshus",
    "sourceCollection": "apartments",
    "city": "Ljungby",
    "rooms": 3,
    "area": 74,
    "areaMax": null,
    "rent": 8100,
    "available": "2026-08-15",
    "floor": 4,
    "floorsTotal": 5,
    "elevator": true,
    "buildYear": 1992,
    "description": "Rymlig trea högt upp i huset med hiss ända till dörren och utsikt över centrala Ljungby. Balkongen är i söderläge och tar in sol större delen av dagen.\n\nNära till både centrum, skolor och kollektivtrafik. Diskmaskin ingår och lägenheten har genomgående ljusa ytskikt.",
    "images": [
      "https://picsum.photos/seed/apt-ljungby-1/800/600",
      "https://picsum.photos/seed/apt-ljungby-2/800/600",
      "https://picsum.photos/seed/apt-ljungby-3/800/600"
    ],
    "amenities": [
      "Balkong",
      "Hiss",
      "Diskmaskin",
      "Nära centrum"
    ],
    "viewings": [
      {
        "date": "Tis 11 aug",
        "time": "17:30–18:00"
      }
    ],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "svenljunga-rydinsvag-9",
    "listingType": "attefallshus",
    "sourceCollection": "apartments",
    "city": "Svenljunga",
    "rooms": 1,
    "area": 41,
    "areaMax": null,
    "rent": 5200,
    "available": "2026-10-01",
    "floor": 1,
    "floorsTotal": 2,
    "elevator": false,
    "buildYear": 1975,
    "description": "Mysig etta i lugnt kvarter i Svenljunga, med egen uteplats direkt utanför fönstret. Perfekt för dig som vill ha nära till naturen men ändå bo i tätorten.\n\nHusdjur är välkomna och det finns ett förråd för cyklar och säsongsprylar i anslutning till fastigheten.",
    "images": [
      "https://picsum.photos/seed/apt-svenljunga-1/800/600",
      "https://picsum.photos/seed/apt-svenljunga-2/800/600",
      "https://picsum.photos/seed/apt-svenljunga-3/800/600"
    ],
    "amenities": [
      "Uteplats",
      "Husdjur tillåtna",
      "Förråd"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "varnamo-parkgatan-3",
    "listingType": "attefallshus",
    "sourceCollection": "apartments",
    "city": "Värnamo",
    "rooms": 4,
    "area": 96,
    "areaMax": null,
    "rent": 10250,
    "available": "2026-09-15",
    "floor": 6,
    "floorsTotal": 7,
    "elevator": true,
    "buildYear": 2017,
    "description": "Modern fyra högst upp i huset med hiss, stor balkong och fin utsikt över Värnamo. Byggd 2017 med tidsenlig standard i både kök och badrum.\n\nGott om förvaring i klädkammare och förråd, och diskmaskin finns installerad i köket. Husdjur tillåtna efter överenskommelse.",
    "images": [
      "https://picsum.photos/seed/apt-varnamo-1/800/600",
      "https://picsum.photos/seed/apt-varnamo-2/800/600",
      "https://picsum.photos/seed/apt-varnamo-3/800/600"
    ],
    "amenities": [
      "Balkong",
      "Hiss",
      "Diskmaskin",
      "Förråd",
      "Husdjur tillåtna"
    ],
    "viewings": [
      {
        "date": "Ons 12 aug",
        "time": "16:00–16:30"
      },
      {
        "date": "Lör 15 aug",
        "time": "11:00–11:30"
      }
    ],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "jarnvagsgatan-8-vaggeryd",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Vaggeryd",
    "rooms": 6,
    "area": 880,
    "areaMax": null,
    "rent": 58000,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Butiks/affärslokal på 880 kvm mitt i centrala Vaggeryd. Lokalen är på två plan.\n\nFastigheten\nByggnaden är uppförd i souterräng med stora skyltfönster mot gatan och en välfrekventerad entré från torget. Planlösningen är flexibel och kan enkelt delas upp i flera mindre enheter efter verksamhetens behov.\n\nKommunikationer\nLäget är centralt med gångavstånd till järnvägsstationen, busshållplats och gott om kundparkering direkt utanför fastigheten.",
    "images": [
      "https://picsum.photos/seed/bofast-vaggeryd-jarnvagsgatan-1/1200/760",
      "https://picsum.photos/seed/bofast-vaggeryd-jarnvagsgatan-2/1200/760",
      "https://picsum.photos/seed/bofast-vaggeryd-jarnvagsgatan-3/1200/760"
    ],
    "amenities": [
      "Skyltfönster",
      "Kundparkering",
      "Lastintag",
      "Fiber",
      "Nära kollektivtrafik"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "bankgatan-5-gnosjo-200",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Gnosjö",
    "rooms": 4,
    "area": 200,
    "areaMax": null,
    "rent": 16500,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Butiks/affärslokal på 200 kvm i centrala Gnosjö. Lokalen är på två plan och kök med pentry finns.\n\nFastigheten\nHuset ligger i ett av Gnosjös mest trafikerade handelsstråk med god exponering mot gatan. Övervåningen fungerar bra som kontors- eller personalyta med eget pentry.\n\nKommunikationer\nP-platser finns i direkt anslutning till fastigheten och det är nära till både centrum och riksväg 26/151.",
    "images": [
      "https://picsum.photos/seed/bofast-gnosjo-bankgatan-200-1/1200/760",
      "https://picsum.photos/seed/bofast-gnosjo-bankgatan-200-2/1200/760",
      "https://picsum.photos/seed/bofast-gnosjo-bankgatan-200-3/1200/760"
    ],
    "amenities": [
      "Pentry",
      "Två plan",
      "Parkering",
      "Fiber"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "bankgatan-5-gnosjo-60",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Gnosjö",
    "rooms": 2,
    "area": 60,
    "areaMax": null,
    "rent": 6900,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Butiks- affärs eller kontorslokal i centrala Gnosjö på 60 kvm. Lokalen består av två rum och ett pentry.\n\nFastigheten\nEn kompakt och lättskött lokal som passar mindre verksamheter, kontor eller ateljé. Delar entré och gemensamma ytor med grannlokalen på 200 kvm i samma hus.\n\nKommunikationer\nCentralt läge med parkering i anslutning till fastigheten.",
    "images": [
      "https://picsum.photos/seed/bofast-gnosjo-bankgatan-60-1/1200/760",
      "https://picsum.photos/seed/bofast-gnosjo-bankgatan-60-2/1200/760",
      "https://picsum.photos/seed/bofast-gnosjo-bankgatan-60-3/1200/760"
    ],
    "amenities": [
      "Pentry",
      "Parkering",
      "Fiber"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "storgatan-13-tranemo",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Tranemo",
    "rooms": 1,
    "area": 13,
    "areaMax": null,
    "rent": 2400,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Placerad vid Storgatan, utgör vår fastighet en knutpunkt för affärsverksamhet och möjligheter mitt i hjärtat av Tranemo.\n\nFastigheten\nEn liten, representativ lokal som passar utmärkt som kontor, showroom eller mindre butiksyta.\n\nKommunikationer\nGångavstånd till torget och goda parkeringsmöjligheter i centrum.",
    "images": [
      "https://picsum.photos/seed/bofast-tranemo-storgatan-13-1/1200/760",
      "https://picsum.photos/seed/bofast-tranemo-storgatan-13-2/1200/760",
      "https://picsum.photos/seed/bofast-tranemo-storgatan-13-3/1200/760"
    ],
    "amenities": [
      "Skyltfönster",
      "Fiber",
      "Nära centrum"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "skreavagen-5-falkenberg-restaurang",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Falkenberg",
    "rooms": 5,
    "area": 148,
    "areaMax": null,
    "rent": 21000,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Restauranglokal med komplett kök, plats för sittande gäster. Lokalen har tillgång till utrymmen så som disk, förråd, kontor och toalett. Fastigheten ligger nära E6 och har goda p-platsmöjligheter.\n\nFastigheten\nKöket är fullt utrustat för restaurangverksamhet och lokalen har en ljus, öppen matsal med plats för sällskap av varierande storlek.\n\nKommunikationer\nMycket goda skyltlägen mot Skreavägen och nära på- och avfart till E6, vilket gör lokalen lättillgänglig för både gäster och leveranser.",
    "images": [
      "https://picsum.photos/seed/bofast-falkenberg-restaurang-1/1200/760",
      "https://picsum.photos/seed/bofast-falkenberg-restaurang-2/1200/760",
      "https://picsum.photos/seed/bofast-falkenberg-restaurang-3/1200/760"
    ],
    "amenities": [
      "Fullt utrustat kök",
      "Förråd",
      "Kontor",
      "Parkering",
      "Nära E6",
      "Uteplats"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "skreavagen-5-falkenberg-kontor-lager",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Falkenberg",
    "rooms": 8,
    "area": 200,
    "areaMax": 880,
    "rent": 42000,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Anpassningsbar kontorslokal med möjlighet till lagerytor i varierande storlekar mellan 200-880 kvm. Fastigheten ligger nära E6 och har goda p-platsmöjligheter. Lokalen har även fiberanslutning.\n\nFastigheten\nYtorna kan kombineras eller delas upp efter behov, med separata in- och utlastningsmöjligheter för lagerdelen och ett eget kontorsplan med pentry och konferensrum.\n\nKommunikationer\nMycket bra logistikläge tack vare närheten till E6, med enkla in- och utfarter för tyngre fordon.",
    "images": [
      "https://picsum.photos/seed/bofast-falkenberg-kontor-lager-1/1200/760",
      "https://picsum.photos/seed/bofast-falkenberg-kontor-lager-2/1200/760",
      "https://picsum.photos/seed/bofast-falkenberg-kontor-lager-3/1200/760"
    ],
    "amenities": [
      "Lastintag",
      "Konferensrum",
      "Pentry",
      "Fiber",
      "Parkering",
      "Nära E6"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "torggatan-10-gislaved",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Gislaved",
    "rooms": 1,
    "area": 10,
    "areaMax": null,
    "rent": 1800,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Lokalerna på ca 10 kvm är i ett kontorshotell med gemensamma ytor som konferenslokal, kök och toalett. Lokalerna har fiber. Fastigheten är bra placerad på Torggatan vid Citytorget. P-plats finns i anslutning till lokalen.\n\nFastigheten\nPasserar för dig som vill ha eget kontor men slippa ansvaret för gemensamma ytor – städning av kök och konferensrum ingår i hyran.\n\nKommunikationer\nMitt i centrala Gislaved med gångavstånd till butiker, service och kollektivtrafik.",
    "images": [
      "https://picsum.photos/seed/bofast-gislaved-torggatan-10-1/1200/760",
      "https://picsum.photos/seed/bofast-gislaved-torggatan-10-2/1200/760",
      "https://picsum.photos/seed/bofast-gislaved-torggatan-10-3/1200/760"
    ],
    "amenities": [
      "Kontorshotell",
      "Konferensrum",
      "Fiber",
      "Nära centrum"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "torggatan-4c-gislaved",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Gislaved",
    "rooms": 5,
    "area": 200,
    "areaMax": null,
    "rent": 19500,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Lokalen är bra placerad i centrala Gislaved vid Citytorget på Torggatan. Parkeringsplats finns i anslutning till lokalen.\n\nFastigheten\nRymlig butiks- eller kontorslokal med stora skyltfönster mot Citytorget och bra takhöjd, vilket ger goda möjligheter för egen exponering och inredning.\n\nKommunikationer\nCentralt läge med parkering precis utanför och nära anslutning till kollektivtrafiken.",
    "images": [
      "https://picsum.photos/seed/bofast-gislaved-torggatan-4c-1/1200/760",
      "https://picsum.photos/seed/bofast-gislaved-torggatan-4c-2/1200/760",
      "https://picsum.photos/seed/bofast-gislaved-torggatan-4c-3/1200/760"
    ],
    "amenities": [
      "Skyltfönster",
      "Parkering",
      "Fiber",
      "Nära centrum"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  },
  {
    "id": "storgatan-16-tranemo",
    "listingType": "attefallshus_med_kallare",
    "sourceCollection": "Lokaler",
    "city": "Tranemo",
    "rooms": 10,
    "area": 640,
    "areaMax": null,
    "rent": 47000,
    "available": null,
    "floor": null,
    "floorsTotal": null,
    "elevator": null,
    "buildYear": null,
    "description": "Vi är glada över att erbjuda butikslokaler som sträcker sig över imponerande 640 kvadratmeter, med stor potential centralt belägen i Tranemo. Placerad vid Storgatan, utgör vår fastighet en knutpunkt för affärsverksamhet och möjligheter mitt i hjärtat av Tranemo.\n\nFastigheten\nStora, sammanhängande butiksytor i markplan med flera möjliga skyltlägen mot gatan. Lokalen kan anpassas efter hyresgästens verksamhet, från handel till showroom.\n\nKommunikationer\nCentralt läge i Tranemo med gott om parkering och gångavstånd till torget.",
    "images": [
      "https://picsum.photos/seed/bofast-tranemo-storgatan-16-1/1200/760",
      "https://picsum.photos/seed/bofast-tranemo-storgatan-16-2/1200/760",
      "https://picsum.photos/seed/bofast-tranemo-storgatan-16-3/1200/760"
    ],
    "amenities": [
      "Skyltfönster",
      "Parkering",
      "Lastintag",
      "Fiber"
    ],
    "viewings": [],
    "contacts": "BOFAST_CONTACTS"
  }
];

export const LISTINGS: Listing[] = BASE_LISTINGS.map((listing) => ({
  ...listing,
  ...PLACEHOLDER_SPECS,
}));
