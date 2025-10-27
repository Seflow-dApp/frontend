import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#22C55E",
          borderRadius: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Coin stack representation - larger for apple icon */}
          <div
            style={{
              width: "24px",
              height: "24px",
              backgroundColor: "#FFF",
              borderRadius: "50%",
              marginBottom: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          <div
            style={{
              width: "36px",
              height: "18px",
              backgroundColor: "#FFF",
              borderRadius: "50%",
              marginBottom: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          <div
            style={{
              width: "48px",
              height: "24px",
              backgroundColor: "#FFF",
              borderRadius: "50%",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />

          {/* Small "S" for Seflow */}
          <div
            style={{
              position: "absolute",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#22C55E",
              fontFamily: "system-ui",
              marginTop: "8px",
            }}
          >
            S
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
