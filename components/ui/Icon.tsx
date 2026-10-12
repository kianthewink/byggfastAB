import type { SVGProps } from "react";

export type IconName =
  | "search"
  | "user"
  | "wrench"
  | "chevron-down"
  | "arrow-left"
  | "arrow-right"
  | "menu"
  | "close"
  | "check"
  | "lock"
  | "eye"
  | "eye-off"
  | "shield"
  | "mail"
  | "phone"
  | "heart"
  | "heart-filled"
  | "star"
  | "star-filled"
  | "expand"
  | "chevron-left"
  | "chevron-right"
  | "map-pin"
  | "home"
  | "floorplan"
  | "stairs"
  | "receipt"
  | "calendar"
  | "area"
  | "ruler"
  | "bed"
  | "file-pdf"
  | "factory"
  | "download"
  | "compare";

const paths: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18v3h3l6.4-6.3a4 4 0 0 0 5.3-5.4l-2.6 2.6-2.1-2.1 2.6-2.5z" />
  ),
  "chevron-down": <polyline points="6 9 12 15 18 9" />,
  "arrow-left": (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
  "arrow-right": (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M9.9 4.2A11 11 0 0 1 12 4c6.4 0 10 8 10 8a18.5 18.5 0 0 1-3.2 4.2M6.6 6.6A18.6 18.6 0 0 0 2 12s3.6 8 10 8a10.8 10.8 0 0 0 4.4-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </>
  ),
  shield: <path d="M12 3l7 3v5c0 4.4-2.9 8.4-7 10-4.1-1.6-7-5.6-7-10V6l7-3z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </>
  ),
  phone: (
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3z" />
  ),
  heart: (
    <path d="M12 20.3s-7-4.4-9.5-9C.8 8 2 4.5 5.3 3.7c2-.5 3.9.3 5 2 .8 1.2.9 1.2 1.7 0 1.1-1.7 3-2.5 5-2 3.3.8 4.5 4.3 2.8 7.6-2.5 4.6-9.5 9-9.5 9z" />
  ),
  "heart-filled": (
    <path
      d="M12 20.3s-7-4.4-9.5-9C.8 8 2 4.5 5.3 3.7c2-.5 3.9.3 5 2 .8 1.2.9 1.2 1.7 0 1.1-1.7 3-2.5 5-2 3.3.8 4.5 4.3 2.8 7.6-2.5 4.6-9.5 9-9.5 9z"
      fill="currentColor"
    />
  ),
  star: (
    <path d="M12 2.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.77l-6.18 3.73L7 14.63l-5-4.87 6.91-1L12 2.5z" />
  ),
  "star-filled": (
    <path
      d="M12 2.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.77l-6.18 3.73L7 14.63l-5-4.87 6.91-1L12 2.5z"
      fill="currentColor"
    />
  ),
  expand: (
    <>
      <polyline points="15 4 20 4 20 9" />
      <polyline points="9 20 4 20 4 15" />
      <line x1="20" y1="4" x2="14" y2="10" />
      <line x1="4" y1="20" x2="10" y2="14" />
    </>
  ),
  "chevron-left": <polyline points="15 6 9 12 15 18" />,
  "chevron-right": <polyline points="9 6 15 12 9 18" />,
  "map-pin": (
    <>
      <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
    </>
  ),
  floorplan: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <line x1="12" y1="4" x2="12" y2="12" />
      <line x1="4" y1="12" x2="12" y2="12" />
    </>
  ),
  stairs: <polyline points="3 21 3 17 9 17 9 13 15 13 15 9 21 9" />,
  receipt: (
    <>
      <path d="M6 3h12v16l-2-1-2 1-2-1-2 1-2-1-2 1V3z" />
      <line x1="8.5" y1="8" x2="15.5" y2="8" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  area: <rect x="4" y="4" width="16" height="16" rx="1" />,
  ruler: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1" transform="rotate(-45 12 12)" />
      <line x1="9.2" y1="9.2" x2="10.6" y2="10.6" />
      <line x1="11.3" y1="7.1" x2="12.7" y2="8.5" />
      <line x1="7.1" y1="11.3" x2="8.5" y2="12.7" />
      <line x1="13.4" y1="5" x2="14.8" y2="6.4" />
    </>
  ),
  bed: (
    <>
      <path d="M3 5v14" />
      <path d="M3 15h18v4" />
      <path d="M3 11h13a5 5 0 0 1 5 4" />
      <rect x="6" y="8" width="4" height="3" rx="1" />
    </>
  ),
  "file-pdf": (
    <>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <polyline points="14 3 14 8 19 8" />
      <line x1="8.5" y1="13" x2="15.5" y2="13" />
      <line x1="8.5" y1="16.5" x2="13" y2="16.5" />
    </>
  ),
  factory: (
    <>
      <path d="M3 21V10l5 3V10l5 3V10l5 3V4h3v17z" />
      <line x1="7" y1="17" x2="8" y2="17" />
      <line x1="12" y1="17" x2="13" y2="17" />
      <line x1="17" y1="17" x2="18" y2="17" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <rect x="14" y="4" width="7" height="16" rx="1" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="5" y1="20" x2="19" y2="20" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

/** Lightweight inline SVG icon set (stroke-based, inherits currentColor). */
export default function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
