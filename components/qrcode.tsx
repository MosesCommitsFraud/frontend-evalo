import React, { useEffect, useState } from "react";

const QRCode = ({
  text,
  size = 256,
  level = "M",
}: {
  text: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
}) => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  useEffect(() => {
    // Generate QR code when text changes
    if (text) {
      generateQRCode(text, level);
    }
  }, [text, level]);

  const generateQRCode = async (text: string, level: "L" | "M" | "Q" | "H") => {
    try {
      // We'll use a dynamic import to load the QR code library
      // This avoids issues with SSR since window isn't available server-side
      const QRCodeGenerator = await import("qrcode");

      // Generate QR code as data URL
      QRCodeGenerator.toDataURL(
        text,
        {
          errorCorrectionLevel: level,
          margin: 1,
          width: size,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (err, url) => {
          if (err) {
            console.error("Error generating QR code:", err);
            return;
          }
          setQrCodeData(url);
        },
      );
    } catch (error) {
      console.error("Failed to load QR code library:", error);
    }
  };

  // Render QR code as image if data is available, otherwise show loading state
  return (
    <div className="flex items-center justify-center bg-white w-full h-full rounded-lg">
      {qrCodeData ? (
        <img src={qrCodeData} alt="QR Code" className="max-w-full max-h-full" />
      ) : (
        <div className="text-gray-400 animate-pulse">Generating QR code...</div>
      )}
    </div>
  );
};

export default QRCode;
