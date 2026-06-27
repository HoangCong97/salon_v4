"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  // Helper to check if a tab is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${isActive("/") ? "active" : ""}`}>
        <span className="bottom-nav-icon">🏠</span>
        <span>Trang chủ</span>
      </Link>
      
      <Link href="/booking" className={`bottom-nav-item ${isActive("/booking") ? "active" : ""}`}>
        <span className="bottom-nav-icon">📅</span>
        <span>Đặt lịch</span>
      </Link>
      
      <Link href="/profile" className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}>
        <span className="bottom-nav-icon">👤</span>
        <span>Hồ sơ</span>
      </Link>
    </nav>
  );
}
