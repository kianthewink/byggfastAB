"use client";

/**
 * Last-resort fallback for a crash in the root layout itself — vanishingly
 * rare, since app/layout.tsx only sets up fonts and the <html>/<body> shell.
 * Next.js renders this outside the normal module tree, so it can't rely on
 * Tailwind or site.css being available; everything here is inline styles.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sv">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#ffffff",
          color: "#1a1a1a",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Något gick fel
          </h1>
          <p style={{ marginTop: "0.5rem", color: "#6b6b6b", fontSize: "0.875rem" }}>
            Sidan kunde inte laddas. Prova att ladda om.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.25rem",
              borderRadius: "0.375rem",
              padding: "0.5rem 1.5rem",
              fontSize: "0.875rem",
              color: "#ffffff",
              background: "#22548F",
              border: "none",
              cursor: "pointer",
            }}
          >
            Försök igen
          </button>
        </div>
      </body>
    </html>
  );
}
