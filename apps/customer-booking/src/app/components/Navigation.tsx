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
        <span className="bottom-nav-icon" style={{ display: 'inline-flex', marginBottom: '4px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </span>
        <span>Trang chủ</span>
      </Link>
      
      <Link href="/booking" className={`bottom-nav-item ${isActive("/booking") ? "active" : ""}`}>
        <span className="bottom-nav-icon" style={{ display: 'inline-flex', marginBottom: '4px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </span>
        <span>Đặt lịch</span>
      </Link>
      
      <Link href="/profile" className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}>
        <span className="bottom-nav-icon" style={{ display: 'inline-flex', marginBottom: '4px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </span>
        <span>Hồ sơ</span>
      </Link>
    </nav>
  );
}
