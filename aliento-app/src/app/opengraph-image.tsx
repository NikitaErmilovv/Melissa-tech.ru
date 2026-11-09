import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.fullName;

export default async function OpengraphImage() {
  const logoData = await readFile(join(process.cwd(), "public/images/logo-512.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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
          background: "#050507",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: 250,
            width: 820,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(251,237,163,0.65) 0%, rgba(212,194,122,0.3) 45%, rgba(212,194,122,0) 72%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,241,188,0.35) 0%, rgba(168,148,88,0.14) 55%, rgba(168,148,88,0) 80%)",
            display: "flex",
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={140}
          height={140}
          style={{ borderRadius: 28, marginBottom: 36 }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            color: "#f5f5f8",
            letterSpacing: -2,
          }}
        >
          ALIENTO
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 32,
            color: "#fbeda3",
            textAlign: "center",
            maxWidth: 880,
          }}
        >
          Школа бачаты
        </div>
      </div>
    ),
    { ...size }
  );
}
