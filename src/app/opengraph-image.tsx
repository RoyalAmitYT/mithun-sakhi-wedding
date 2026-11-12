import { ImageResponse } from "next/og";
import { WEDDING_DATA } from "@/data/wedding-data";

export const alt = `${WEDDING_DATA.couple.displayTitle} — ${WEDDING_DATA.couple.weddingDatesDisplay}, ${WEDDING_DATA.couple.locationDisplay}`;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const { couple } = WEDDING_DATA;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFCF6",
          padding: "48px",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Outer Fine Gold Hairline Frame */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            right: "24px",
            bottom: "24px",
            border: "2px solid rgba(184, 151, 94, 0.45)",
            borderRadius: "6px",
            display: "flex",
          }}
        />

        {/* Inner Subtle Secondary Frame */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "32px",
            right: "32px",
            bottom: "32px",
            border: "1px solid rgba(184, 151, 94, 0.2)",
            borderRadius: "4px",
            display: "flex",
          }}
        />

        {/* Ceremonial Monogram Seal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            border: "2px solid #B8975E",
            backgroundColor: "#FFFFFF",
            marginBottom: "24px",
            boxShadow: "0 4px 16px rgba(184, 151, 94, 0.15)",
          }}
        >
          <span
            style={{
              fontSize: "36px",
              color: "#292322",
              letterSpacing: "2px",
            }}
          >
            M&bull;S
          </span>
        </div>

        {/* Eyebrow Label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "16px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#A52232",
            fontWeight: 600,
            marginBottom: "12px",
            fontFamily: "sans-serif",
          }}
        >
          <span>The Sacred Wedding Celebration</span>
        </div>

        {/* Couple Names */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: "76px",
            fontWeight: 500,
            color: "#292322",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          <span>Mithun</span>
          <span
            style={{
              color: "#B8975E",
              fontStyle: "italic",
              fontSize: "58px",
              margin: "0 18px",
            }}
          >
            &amp;
          </span>
          <span>Sakhi</span>
        </div>

        {/* Divider Flourish */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "360px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "rgba(184, 151, 94, 0.5)",
            }}
          />
          <div
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "#B8975E",
              transform: "rotate(45deg)",
              margin: "0 14px",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "rgba(184, 151, 94, 0.5)",
            }}
          />
        </div>

        {/* Dates and Location */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              color: "#292322",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {couple.weddingDatesDisplay}
          </span>
          <span
            style={{
              fontSize: "20px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#B8975E",
              fontWeight: 600,
              fontFamily: "sans-serif",
            }}
          >
            {couple.locationDisplay}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
