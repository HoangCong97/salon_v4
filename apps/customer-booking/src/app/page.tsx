"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Branch {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  address: string;
  logoUrl?: string;
  bannerUrl?: string;
  tenant: {
    name: string;
    logoUrl?: string;
    brandName?: string;
  };
}

interface Review {
  id: string;
  customerName: string;
  ratingStars: number;
  comment: string;
  date: string;
  serviceName: string;
}

interface Tenant {
  id: string;
  name: string;
  brandName?: string;
  slogan?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
}

const API_BASE = "http://localhost:3000/api/customer-portal";

export default function Home() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch Tenants
  useEffect(() => {
    fetch(`${API_BASE}/tenants`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTenants(data);
          // Auto-select the first tenant as default (e.g. HairStar)
          setSelectedTenant(data[0]);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching tenants:", err);
        setLoading(false);
      });
  }, []);

  // 2. Fetch Branches and Reviews once Tenant is selected
  useEffect(() => {
    if (!selectedTenant) return;

    setLoading(true);
    const branchesPromise = fetch(`${API_BASE}/branches?tenantId=${selectedTenant.id}`)
      .then((res) => res.json())
      .then((data) => setBranches(Array.isArray(data) ? data : []));

    const reviewsPromise = fetch(`${API_BASE}/${selectedTenant.id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []));

    Promise.all([branchesPromise, reviewsPromise])
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Error loading tenant details:", err);
        setLoading(false);
      });
  }, [selectedTenant]);

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-slide-up">
      {/* Hero Banner Header */}
      <div
        style={{
          background: selectedTenant?.bannerUrl 
            ? `linear-gradient(180deg, rgba(5,7,10,0.4) 0%, #090d16 100%), url(${selectedTenant.bannerUrl}) center/cover`
            : "linear-gradient(135deg, #1e1b4b 0%, #090d16 100%)",
          padding: "40px 20px 30px",
          textAlign: "center",
          borderBottom: "1px solid var(--border-color)",
          minHeight: "180px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center"
        }}
      >
        {selectedTenant?.logoUrl && (
          <img
            src={selectedTenant.logoUrl}
            alt={selectedTenant.name}
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              border: "2px solid var(--primary)",
              marginBottom: "12px",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)"
            }}
          />
        )}
        <h1 style={{ fontSize: "1.8rem", color: "var(--text-main)", marginBottom: "4px" }}>
          {selectedTenant?.brandName || selectedTenant?.name || "Premium Hair Salon"}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "500", letterSpacing: "1px" }}>
          {selectedTenant?.slogan || "Tỏa sáng phong cách của bạn"}
        </p>
      </div>

      <div className="container">
        {/* Tenant selector if multiple brands exist */}
        {tenants.length > 1 && (
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label">Chọn thương hiệu salon:</label>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" }}>
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTenant(t)}
                  className={`btn ${selectedTenant?.id === t.id ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "auto", padding: "8px 16px", fontSize: "0.85rem", flexShrink: 0 }}
                >
                  {t.brandName || t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Brand Intro info */}
        <div className="card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, rgba(245,158,11,0.03) 0%, rgba(18,26,47,0.4) 100%)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", color: "var(--primary)" }}>Giới thiệu</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Chào mừng bạn đến với hệ thống Salon chuyên nghiệp hàng đầu. Chúng tôi cung cấp các dịch vụ cắt, tạo kiểu, uốn nhuộm và chăm sóc tóc chuyên sâu, cam kết đem lại trải nghiệm thư giãn đẳng cấp cùng diện mạo hoàn hảo.
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', margin: '0 auto 8px', display: 'block' }}><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>Chuyên Nghiệp</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', margin: '0 auto 8px', display: 'block' }}><path d="M6 3h12l4 6-10 13L2 9z"></path><path d="M11 3 8 9l3 13h2l3-13-3-6z"></path><path d="M2 9h20"></path></svg>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>Premium Spa</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', margin: '0 auto 8px', display: 'block' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>Ưu Đãi Lớn</div>
            </div>
          </div>
        </div>

        {/* Quick Booking CTA */}
        {selectedTenant && (
          <Link href={`/booking?tenantId=${selectedTenant.id}`} style={{ textDecoration: "none", display: "block", marginBottom: "28px" }}>
            <button className="btn btn-primary">
              <span>Đặt Lịch Hẹn Ngay</span>
            </button>
          </Link>
        )}

        {/* Branches list section */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>Tìm Chi Nhánh</h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>({filteredBranches.length} chi nhánh)</span>
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Nhập tên chi nhánh, đường, quận..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              Đang tải danh sách chi nhánh...
            </div>
          ) : filteredBranches.length > 0 ? (
            filteredBranches.map((b) => (
              <div key={b.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "4px" }}>{b.name}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Địa chỉ: {b.address}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Điện thoại: {b.phone}</p>
                </div>
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "flex-end" }}>
                  <Link href={`/booking?tenantId=${b.tenantId}&branchId=${b.id}`} style={{ textDecoration: "none" }}>
                    <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem", width: "auto" }}>
                      Đặt lịch tại đây
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
              Không tìm thấy chi nhánh nào phù hợp.
            </div>
          )}
        </div>

        {/* Customer reviews/Testimonials list */}
        {reviews.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.2rem", color: "var(--text-main)", marginBottom: "12px" }}>Khách Hàng Đánh Giá</h2>
            <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none" }}>
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="card"
                  style={{
                    flex: "0 0 260px",
                    marginBottom: 0,
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>{r.customerName}</span>
                      <span style={{ color: "var(--primary)", fontSize: "0.8rem" }}>
                        {"★".repeat(r.ratingStars)}
                        {"☆".repeat(5 - r.ratingStars)}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "8px", lineClamp: 3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      "{r.comment || "Dịch vụ tuyệt vời, sẽ quay lại lần sau!"}"
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", color: "var(--text-disabled)", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "6px" }}>
                    <span>{r.serviceName}</span>
                    <span>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
