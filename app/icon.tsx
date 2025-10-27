import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "8px",
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
          {/* Coin stack representation */}
          <div
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "#FFF",
              borderRadius: "50%",
              marginBottom: "1px",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "6px",
              backgroundColor: "#FFF",
              borderRadius: "50%",
              marginBottom: "1px",
            }}
          />
          <div
            style={{
              width: "16px",
              height: "8px",
              backgroundColor: "#FFF",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
