import { ImageResponse } from "next/og";
import { siteName } from "@/lib/site";

export const alt = siteName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og renders in its own context without the site CSS, so colours are literal here.
const OpengraphImage = () =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        background: "#ffffff",
        color: "#262626",
      }}
    >
      <div style={{ fontSize: 32, color: "#595959" }}>Design systems</div>
      <div style={{ fontSize: 88, fontWeight: 700, marginTop: 16 }}>
        Interfaces built from tokens
      </div>
    </div>,
    size,
  );

export default OpengraphImage;
