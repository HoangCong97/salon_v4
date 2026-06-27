import React from "react";
import "./globals.css";
import Navigation from "./components/Navigation";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata = {
  title: "Đặt lịch Salon Trực tuyến",
  description: "Hệ thống đặt lịch làm tóc và spa trực tuyến nhanh chóng.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="app-shell">
          {children}
          <Navigation />
        </div>
      </body>
    </html>
  );
}
