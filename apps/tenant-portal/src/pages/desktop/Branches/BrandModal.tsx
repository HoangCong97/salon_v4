import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantInfo: any;
  onSave: (payload: any) => Promise<void>;
}

export default function BrandModal({ isOpen, onClose, tenantInfo, onSave }: BrandModalProps) {
  const [brandNameText, setBrandNameText] = useState("");
  const [brandNameInput, setBrandNameInput] = useState("");
  const [brandSloganInput, setBrandSloganInput] = useState("");
  const [brandLogoInput, setBrandLogoInput] = useState("");
  const [brandBannerInput, setBrandBannerInput] = useState("");
  const [brandHotlineInput, setBrandHotlineInput] = useState("");
  const [brandEmailInput, setBrandEmailInput] = useState("");
  const [brandAddressInput, setBrandAddressInput] = useState("");
  const [brandFanpageInput, setBrandFanpageInput] = useState("");
  const [brandInstagramInput, setBrandInstagramInput] = useState("");
  const [brandTiktokInput, setBrandTiktokInput] = useState("");
  const [brandWebsiteInput, setBrandWebsiteInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenantInfo && isOpen) {
      setBrandNameText(tenantInfo.name || "");
      setBrandNameInput(tenantInfo.brandName || "");
      setBrandSloganInput(tenantInfo.slogan || "");
      setBrandLogoInput(tenantInfo.logoUrl || "");
      setBrandBannerInput(tenantInfo.bannerUrl || "");
      setBrandHotlineInput(tenantInfo.hotline || "");
      setBrandEmailInput(tenantInfo.email || "");
      setBrandAddressInput(tenantInfo.address || "");
      setBrandFanpageInput(tenantInfo.fanpageUrl || "");
      setBrandInstagramInput(tenantInfo.instagramUrl || "");
      setBrandTiktokInput(tenantInfo.tiktokUrl || "");
      setBrandWebsiteInput(tenantInfo.websiteUrl || "");
    }
  }, [tenantInfo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandNameText.trim()) return;

    setSaving(true);
    try {
      await onSave({
        name: brandNameText,
        brandName: brandNameInput || null,
        slogan: brandSloganInput || null,
        logoUrl: brandLogoInput || null,
        bannerUrl: brandBannerInput || null,
        hotline: brandHotlineInput || null,
        email: brandEmailInput || null,
        address: brandAddressInput || null,
        fanpageUrl: brandFanpageInput || null,
        instagramUrl: brandInstagramInput || null,
        tiktokUrl: brandTiktokInput || null,
        websiteUrl: brandWebsiteInput || null
      });
      onClose();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "580px", position: "relative" }}>
        <button
          type="button"
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
          Thiết lập thương hiệu chung
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: "65vh", overflowY: "auto", overflowX: "hidden", paddingLeft: "8px", paddingRight: "8px", paddingBottom: "12px" }}>
            
            {/* Section 1: Basic Info */}
            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
              Thông tin thương hiệu gốc
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tên tổng công ty / Thương hiệu gốc *</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={brandNameText}
                  onChange={(e) => setBrandNameText(e.target.value)}
                  placeholder="Ví dụ: Công ty Cổ phần Salon VIP"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slogan thương hiệu</label>
                <input
                  className="form-input"
                  type="text"
                  value={brandSloganInput}
                  onChange={(e) => setBrandSloganInput(e.target.value)}
                  placeholder="Ví dụ: Tỏa sáng vẻ đẹp Việt"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Section 3: Contact */}
            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
              Liên hệ chung
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hotline chung</label>
                <input
                  className="form-input"
                  type="text"
                  value={brandHotlineInput}
                  onChange={(e) => setBrandHotlineInput(e.target.value)}
                  placeholder="Hotline cskh toàn hệ thống"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email liên hệ chung</label>
                <input
                  className="form-input"
                  type="email"
                  value={brandEmailInput}
                  onChange={(e) => setBrandEmailInput(e.target.value)}
                  placeholder="Email chăm sóc khách hàng toàn hệ thống"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                <label className="form-label">Trụ sở chính</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={brandAddressInput}
                  onChange={(e) => setBrandAddressInput(e.target.value)}
                  placeholder="Địa chỉ trụ sở chính của thương hiệu..."
                  style={{ resize: "none", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Section 4: Public social links */}
            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
              Kênh truyền thông chung
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Link Fanpage (Facebook)</label>
                <input
                  className="form-input"
                  type="text"
                  value={brandFanpageInput}
                  onChange={(e) => setBrandFanpageInput(e.target.value)}
                  placeholder="https://facebook.com/brand"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link Instagram</label>
                <input
                  className="form-input"
                  type="text"
                  value={brandInstagramInput}
                  onChange={(e) => setBrandInstagramInput(e.target.value)}
                  placeholder="https://instagram.com/brand"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link TikTok</label>
                <input
                  className="form-input"
                  type="text"
                  value={brandTiktokInput}
                  onChange={(e) => setBrandTiktokInput(e.target.value)}
                  placeholder="https://tiktok.com/@brand"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Website thương hiệu</label>
                <input
                  className="form-input"
                  type="text"
                  value={brandWebsiteInput}
                  onChange={(e) => setBrandWebsiteInput(e.target.value)}
                  placeholder="https://brand.com"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
            </div>

          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ height: "36px", padding: "0 16px", fontSize: "13px" }} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thương hiệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
