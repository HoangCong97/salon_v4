import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Branch } from "./types";

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  branch: Branch | null;
  tenantInfo: any;
  onSave: (payload: any) => Promise<void>;
}

export default function BranchModal({
  isOpen,
  onClose,
  mode,
  branch,
  tenantInfo,
  onSave,
}: BranchModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [brandName, setBrandName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [hotline, setHotline] = useState("");
  const [fanpageUrl, setFanpageUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && branch) {
        setName(branch.name || "");
        setPhone(branch.phone || "");
        setEmail(branch.email || "");
        setAddress(branch.address || "");
        setBrandName(branch.brandName || "");
        setSlogan(branch.slogan || "");
        setLogoUrl(branch.logoUrl || "");
        setBannerUrl(branch.bannerUrl || "");
        setHotline(branch.hotline || "");
        setFanpageUrl(branch.fanpageUrl || "");
        setInstagramUrl(branch.instagramUrl || "");
        setTiktokUrl(branch.tiktokUrl || "");
        setWebsiteUrl(branch.websiteUrl || "");
      } else {
        setName("");
        setPhone("");
        setEmail("");
        setAddress("");
        setBrandName("");
        setSlogan("");
        setLogoUrl("");
        setBannerUrl("");
        setHotline("");
        setFanpageUrl("");
        setInstagramUrl("");
        setTiktokUrl("");
        setWebsiteUrl("");
      }
    }
  }, [isOpen, mode, branch]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        brandName: brandName || null,
        slogan: slogan || null,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        hotline: hotline || null,
        fanpageUrl: fanpageUrl || null,
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        websiteUrl: websiteUrl || null,
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
          {mode === "create" ? "Thêm chi nhánh mới" : "Chỉnh sửa chi nhánh"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: "65vh", overflowY: "auto", overflowX: "hidden", paddingLeft: "8px", paddingRight: "8px", paddingBottom: "12px" }}>
            
            {/* Section 1: Basic Info */}
            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
              Thông tin cơ bản
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tên chi nhánh *</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Chi nhánh Quận 1"
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slogan riêng</label>
                <input
                  className="form-input"
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder={tenantInfo?.slogan ? `Kế thừa: ${tenantInfo.slogan}` : "Để trống để kế thừa"}
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Section 3: Contact details */}
            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
              Thông tin liên hệ riêng
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Số Hotline riêng (Công khai)</label>
                <input
                  className="form-input"
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  placeholder={tenantInfo?.hotline ? `Kế thừa: ${tenantInfo.hotline}` : "Để trống để kế thừa"}
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Điện thoại chi nhánh</label>
                <input
                  className="form-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={tenantInfo?.phone ? `Kế thừa: ${tenantInfo.phone}` : "Điện thoại CSKH riêng"}
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Email liên hệ riêng</label>
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tenantInfo?.email ? `Kế thừa: ${tenantInfo.email}` : "Email CSKH riêng"}
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Địa chỉ chi nhánh *</label>
                <textarea
                  className="form-input"
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, quận, thành phố..."
                  style={{ resize: "none", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Section 4: Public social links */}
            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
              Mạng xã hội & Kênh truyền thông riêng
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Link Fanpage riêng (Facebook)</label>
                <input
                  className="form-input"
                  type="text"
                  value={fanpageUrl}
                  onChange={(e) => setFanpageUrl(e.target.value)}
                  placeholder={tenantInfo?.fanpageUrl ? `Kế thừa: ${tenantInfo.fanpageUrl}` : "https://facebook.com/..."}
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link Instagram riêng</label>
                <input
                  className="form-input"
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder={tenantInfo?.instagramUrl ? `Kế thừa: ${tenantInfo.instagramUrl}` : "https://instagram.com/..."}
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link TikTok riêng</label>
                <input
                  className="form-input"
                  type="text"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder={tenantInfo?.tiktokUrl ? `Kế thừa: ${tenantInfo.tiktokUrl}` : "https://tiktok.com/@..."}
                  style={{ height: "36px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link Website riêng</label>
                <input
                  className="form-input"
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder={tenantInfo?.websiteUrl ? `Kế thừa: ${tenantInfo.websiteUrl}` : "https://www.example.com"}
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
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
