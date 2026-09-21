"use client";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function TicketQRCode({
  value,
  size = 160,
}: {
  value: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      value,
      { width: size, margin: 1 },
      (err: unknown) => {
        if (err) console.error("QR error", err as Error);
      },
    );
  }, [value, size]);
  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-label="Ticket QR code"
    />
  );
}
