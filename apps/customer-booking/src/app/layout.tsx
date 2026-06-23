import React from "react";

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
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>{children}</body>
    </html>
  );
}
