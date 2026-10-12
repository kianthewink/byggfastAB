import type { Listing } from "./schema";
import { DEFAULT_PACKAGES } from "../build/defaults";

/**
 * Temporary product information so no product page shows empty panels while
 * the real specifications are being collected. Applied to every seed listing
 * and back-filled onto existing rows by scripts/fill-placeholder-specs.ts.
 * Replace per product in the admin panel (or via import) once real data
 * arrives.
 */
export const PLACEHOLDER_SPECS = {
  loftArea: 9.87,
  length: 10.83,
  width: 3.69,
  height: 4.15,
  bedrooms: 2,
  documents: [
    { name: "Planritning", url: "/documents/planritning-exempel.pdf" },
    { name: "Produktblad", url: "/documents/produktblad-exempel.pdf" },
  ],
  packages: DEFAULT_PACKAGES,

  specTak: [
    "Plåttak (klick tak)",
    "Bärläkt 28×70 mm cc 500",
    "Ströläkt 22×45 mm (luftspalt) cc 600",
    "Vindskyddsduk",
    "Takstolar 45×195 mm cc 600",
    "Mineralullsisolering 195 mm",
    "Diffusionsspärr",
    "Glespanel 28×70 mm cc 300",
    "Invändig panel 15 mm",
  ],
  specTakdimensionering: [
    "Taket är dimensionerat för snözon 2,5 kN/m².",
    "Högre snölaster kan beställas som tillval.",
  ],
  specYttervagg: [
    "Utvändig träpanel 22 mm",
    "Spikläkt 28×70 mm (luftspalt)",
    "Vindskyddsskiva 9 mm",
    "Regelstomme 45×145 mm cc 600",
    "Mineralullsisolering 145 mm",
    "Diffusionsspärr",
    "Invändig skiva 13 mm",
  ],
  specGolvbjalklag: [
    "Golvbeläggning laminat",
    "Golvspånskiva 22 mm",
    "Golvreglar 45×195 mm cc 600",
    "Mineralullsisolering 195 mm",
    "Vindskyddsskiva",
  ],
  specGolvbjalklagVatrum: [
    "Klinker med tätskikt enligt branschregler",
    "Golvspånskiva 22 mm, våtrumsklassad",
    "Golvreglar 45×195 mm cc 300",
    "Mineralullsisolering 195 mm",
  ],
  specMellanbjalklag: [
    "Golvspånskiva 22 mm",
    "Bjälkar 45×170 mm cc 600",
    "Invändig panel i tak 15 mm",
  ],
  specInnervagg: [
    "Gipsskiva 13 mm",
    "Regelstomme 45×70 mm cc 600",
    "Ljudisolering 70 mm",
    "Gipsskiva 13 mm",
  ],
  specInnervaggVatrum: [
    "Kakel med tätskikt enligt branschregler",
    "Våtrumsskiva 13 mm",
    "Regelstomme 45×70 mm cc 450",
    "Ljudisolering 70 mm",
  ],

  installUtvandigMalning: [
    "Fasaden levereras grundmålad och färdigmålas på plats i valfri kulör.",
  ],
  installFonsterDorrar: [
    "Treglasfönster med U-värde 1,0 W/m²K.",
    "Ytterdörr med säkerhetslås och tröskel i ek.",
  ],
  installPlat: ["Vindskivor, fotplåt och fönsterbleck i samma kulör som taket."],
  installAvvattning: ["Hängrännor och stuprör i plåt ingår, kopplas till befintlig dagvattenledning."],
  installUppvarmning: [
    "El-radiatorer ingår enligt ritning. Luftvärmepump och vattenburet golvvärmesystem med frånlufts värmepump finns som tillval.",
  ],
  installVentilation: [
    "Mekanisk frånlufts ventilation (Paxfläkt) med frisklufts ventiler. Vid val av frånlufts värmepump hanterar pumpen frånluften i huset.",
  ],
  installBadrum: [
    "Grått klinkergolv 30 × 30 cm med mörkgrå fog",
    "Kakel vit blank 25 × 40 cm på väggar med ljusgrå fog",
    "WC från Ifö alt Gustavsberg",
    "Tvättställ vit 50 cm",
    "Duschset (blandare, handdusch och upphängning) från Grohe / Oras",
    "Varmvattenberedare 80 L",
    "Golvbrunn från Purus",
  ],
  installKok: [
    "Kök enligt ritning med vita luckor och laminatbänkskiva.",
    "Vitvaror (spis, kyl/frys, fläkt) ingår.",
  ],
} satisfies Partial<Listing>;
