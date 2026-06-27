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
              <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>✂️</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Chuyên Nghiệp</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>💎</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Premium Spa</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>✨</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ưu Đãi Lớn</div>
            </div>
          </div>
        </div>

        {/* Quick Booking CTA */}
        {selectedTenant && (
          <Link href={`/booking?tenantId=${selectedTenant.id}`} style={{ textDecoration: "none", display: "block", marginBottom: "28px" }}>
            <button className="btn btn-primary">
              <span>📅 Đặt Lịch Hẹn Ngay</span>
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
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>📍 {b.address}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📞 {b.phone}</p>
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
