import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { MapPin, Phone, Mail, Plus, Edit2, Trash2, Loader2, X, Building2, Camera, RotateCcw } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  brandName?: string;
  slogan?: string;
  logoUrl?: string;
  bannerUrl?: string;
  hotline?: string;
  fanpageUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
}

export default function Branches() {
  const { currentTenantId, setTenant } = useAuthStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Tenant / Brand Form Fields
  const [brandNameText, setBrandNameText] = useState(""); // Tenant Name (e.g. name)
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

  // Branch Form Fields
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

  const fetchTenantInfo = async () => {
    if (!currentTenantId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setTenantInfo(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin thương hiệu:", err);
    }
  };

  const fetchBranches = async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches`);
      if (!res.ok) throw new Error("Không thể tải danh sách chi nhánh");
      const data = await res.json();
      setBranches(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantInfo();
    fetchBranches();
  }, [currentTenantId]);

  const handleOpenBrandModal = () => {
    if (!tenantInfo) return;
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
    setIsBrandModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
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
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setModalMode("edit");
    setSelectedBranchId(branch.id);
    setName(branch.name);
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
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandNameText.trim()) return;

    const payload = {
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
    };

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Lỗi khi lưu thông tin thương hiệu");

      setIsBrandModalOpen(false);
      await fetchTenantInfo();
      await fetchBranches();

      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
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
      websiteUrl: websiteUrl || null
    };

    try {
      let res;
      if (modalMode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${selectedBranchId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Lỗi khi lưu thông tin chi nhánh");

      setIsModalOpen(false);
      await fetchBranches();

      // Update global context so branch selector gets updated
      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Lỗi khi xóa chi nhánh");

      await fetchBranches();

      // Update global context so branch selector gets updated
      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Quick Inline Upload Helper for Tenant
  const updateTenantField = async (fields: any) => {
    if (!tenantInfo) return;
    const payload = {
      name: tenantInfo.name,
      email: tenantInfo.email,
      phone: tenantInfo.phone,
      address: tenantInfo.address,
      brandName: tenantInfo.brandName,
      slogan: tenantInfo.slogan,
      logoUrl: tenantInfo.logoUrl,
      bannerUrl: tenantInfo.bannerUrl,
      hotline: tenantInfo.hotline,
      fanpageUrl: tenantInfo.fanpageUrl,
      instagramUrl: tenantInfo.instagramUrl,
      tiktokUrl: tenantInfo.tiktokUrl,
      websiteUrl: tenantInfo.websiteUrl,
      ...fields
    };
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Không thể cập nhật thương hiệu");
      await fetchTenantInfo();
      await fetchBranches();
      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const uploadFile = async (base64Data: string, category: string, originalFilename?: string): Promise<string> => {
    const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: base64Data,
        category,
        filename: originalFilename
      })
    });
    if (!res.ok) {
      throw new Error("Lỗi khi tải ảnh lên máy chủ");
    }
    const data = await res.json();
    return data.url;
  };

  const handleUploadTenantBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const fileUrl = await uploadFile(base64, "brand", file.name);
        await updateTenantField({ bannerUrl: fileUrl });
      } catch (err: any) {
        alert(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadTenantLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const fileUrl = await uploadFile(base64, "brand", file.name);
        await updateTenantField({ logoUrl: fileUrl });
      } catch (err: any) {
        alert(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Inline Upload Helper for Branch
  const updateBranchField = async (branch: Branch, fields: any) => {
    const payload = {
      name: branch.name,
      phone: branch.phone || null,
      email: branch.email || null,
      address: branch.address || null,
      brandName: branch.brandName || null,
      slogan: branch.slogan || null,
      logoUrl: branch.logoUrl || null,
      bannerUrl: branch.bannerUrl || null,
      hotline: branch.hotline || null,
      fanpageUrl: branch.fanpageUrl || null,
      instagramUrl: branch.instagramUrl || null,
      tiktokUrl: branch.tiktokUrl || null,
      websiteUrl: branch.websiteUrl || null,
      ...fields
    };
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${branch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Không thể cập nhật chi nhánh");
      await fetchBranches();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUploadBranchBanner = (branch: Branch, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const fileUrl = await uploadFile(base64, "branches", file.name);
        await updateBranchField(branch, { bannerUrl: fileUrl });
      } catch (err: any) {
        alert(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBranchLogo = (branch: Branch, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const fileUrl = await uploadFile(base64, "branches", file.name);
        await updateBranchField(branch, { logoUrl: fileUrl });
      } catch (err: any) {
        alert(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <style>{`
        .branch-card {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          transition: all 0.2s ease-in-out;
          position: relative;
        }
        .branch-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-primary);
        }
        .branch-banner {
          height: 120px;
          width: 100%;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .logo-container {
          position: relative;
          cursor: pointer;
        }
        .branch-logo-container {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 3px solid var(--bg-card);
          box-shadow: var(--shadow-md);
          position: absolute;
          left: 20px;
          bottom: -32px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 10;
        }
        .branch-logo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .logo-upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: var(--radius-full);
          background: rgba(15, 23, 42, 0.6);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.2s ease;
          z-index: 12;
        }
        .logo-container:hover .logo-upload-overlay {
          opacity: 1;
        }
        .banner-upload-btn {
          position: absolute;
          right: 12px;
          bottom: 12px;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          z-index: 12;
        }
        .banner-upload-btn:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          transform: scale(1.02);
        }
        .social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: hsl(210, 40%, 96%);
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }
        .social-link:hover {
          background: var(--color-primary-light);
          color: var(--color-primary);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Hidden file inputs for Brand (Tenant) */}
      <input type="file" id="tenant-logo-input" accept="image/*" style={{ display: "none" }} onChange={handleUploadTenantLogo} />
      <input type="file" id="tenant-banner-input" accept="image/*" style={{ display: "none" }} onChange={handleUploadTenantBanner} />

      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Brand Card Summary */}
        {tenantInfo && (
          <div className="card animate-fade-in" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <div style={{
              height: "180px",
              background: tenantInfo.bannerUrl ? `url(${tenantInfo.bannerUrl})` : "linear-gradient(135deg, hsl(221, 83%, 45%) 0%, hsl(260, 80%, 40%) 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative"
            }}>
              {/* Tenant Cover edit controls (Facebook style) */}
              <button className="banner-upload-btn" onClick={() => document.getElementById("tenant-banner-input")?.click()}>
                <Camera size={14} /> Thay đổi ảnh bìa
              </button>
              {tenantInfo.bannerUrl && (
                <button 
                  className="banner-upload-btn" 
                  style={{ right: "156px", background: "rgba(239, 68, 68, 0.85)" }} 
                  onClick={() => updateTenantField({ bannerUrl: null })}
                >
                  Gỡ ảnh bìa
                </button>
              )}

              {/* Tenant Logo container overlay (Facebook style) */}
              <div 
                className="logo-container" 
                onClick={() => document.getElementById("tenant-logo-input")?.click()}
                style={{
                  position: "absolute",
                  left: "24px",
                  bottom: "-40px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--bg-card)",
                  border: "4px solid var(--bg-card)",
                  boxShadow: "var(--shadow-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  zIndex: 11
                }}
              >
                {tenantInfo.logoUrl ? (
                  <img src={tenantInfo.logoUrl} alt="Brand Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Building2 size={32} style={{ color: "var(--color-primary)" }} />
                )}
                <div className="logo-upload-overlay">
                  <Camera size={18} />
                  <span style={{ fontSize: "8px", marginTop: "2px", fontWeight: "600" }}>Thay đổi</span>
                </div>
              </div>
              
              {tenantInfo.logoUrl && (
                <button 
                  title="Gỡ logo gốc"
                  onClick={() => updateTenantField({ logoUrl: null })}
                  style={{
                    position: "absolute",
                    left: "82px",
                    bottom: "-45px",
                    background: "var(--color-danger)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 12,
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <RotateCcw size={11} />
                </button>
              )}
            </div>
            
            <div style={{ padding: "52px 24px 24px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-primary)", padding: "2px 8px", borderRadius: "4px", background: "var(--color-primary-light)" }}>
                  Thông tin thương hiệu (Tổng công ty)
                </span>
                <h1 style={{ fontSize: "22px", fontWeight: "800", marginTop: "8px", marginBottom: "4px" }}>
                  {tenantInfo.brandName || tenantInfo.name}
                </h1>
                {tenantInfo.slogan && (
                  <p style={{ fontSize: "14px", fontStyle: "italic", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    "{tenantInfo.slogan}"
                  </p>
                )}
                
                {/* Contact and Social info row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "var(--text-secondary)", fontSize: "13px", marginTop: "8px" }}>
                  {tenantInfo.hotline && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "var(--color-danger-light)", color: "var(--color-danger)", padding: "1px 5px", borderRadius: "3px" }}>HOTLINE</span>
                      <strong style={{ color: "var(--color-danger)" }}>{tenantInfo.hotline}</strong>
                    </div>
                  )}
                  {tenantInfo.phone && (
                    <div>
                      <span>📞 Điện thoại: </span><strong>{tenantInfo.phone}</strong>
                    </div>
                  )}
                  {tenantInfo.email && (
                    <div>
                      <span>✉️ Email: </span><strong>{tenantInfo.email}</strong>
                    </div>
                  )}
                  {tenantInfo.address && (
                    <div>
                      <span>📍 Trụ sở: </span><strong>{tenantInfo.address}</strong>
                    </div>
                  )}
                </div>

                {/* Social media connections */}
                {(tenantInfo.websiteUrl || tenantInfo.fanpageUrl || tenantInfo.instagramUrl || tenantInfo.tiktokUrl) && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    {tenantInfo.websiteUrl && (
                      <a href={tenantInfo.websiteUrl} target="_blank" rel="noreferrer" title="Website Thương hiệu" className="social-link">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                      </a>
                    )}
                    {tenantInfo.fanpageUrl && (
                      <a href={tenantInfo.fanpageUrl} target="_blank" rel="noreferrer" title="Facebook Thương hiệu" className="social-link">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                      </a>
                    )}
                    {tenantInfo.instagramUrl && (
                      <a href={tenantInfo.instagramUrl} target="_blank" rel="noreferrer" title="Instagram Thương hiệu" className="social-link">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                    )}
                    {tenantInfo.tiktokUrl && (
                      <a href={tenantInfo.tiktokUrl} target="_blank" rel="noreferrer" title="TikTok Thương hiệu" className="social-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}>
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.95-1.72-.01 2.92.01 5.84-.02 8.75-.1 1.6-.54 3.19-1.45 4.51-1.48 2.21-4.2 3.47-6.85 3.14-3.23-.33-5.91-3.09-5.9-6.36.02-3.53 3.13-6.52 6.69-6.07.13.02.26.05.38.08v4.19c-.83-.3-1.79-.19-2.51.35-.78.53-1.18 1.5-1.07 2.44.13 1.34 1.45 2.37 2.78 2.11 1.11-.15 1.86-1.13 1.88-2.22V.02z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <button className="btn btn-secondary" onClick={handleOpenBrandModal} style={{ display: "flex", alignItems: "center", gap: "6px", height: "38px" }}>
                  <Edit2 size={15} /> Cấu hình bằng biểu mẫu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header List */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "20px", marginTop: "10px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700" }}>Danh sách chi nhánh</h2>
          <button className="btn btn-primary" onClick={handleOpenCreateModal} style={{ height: "38px" }}>
            <Plus size={18} /> Thêm chi nhánh
          </button>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : error ? (
          <div className="card" style={{ borderLeft: "4px solid var(--color-danger)", background: "var(--color-danger-light)" }}>
            <p style={{ color: "var(--color-danger)", fontWeight: "500" }}>{error}</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Building2 size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Chưa có chi nhánh nào</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Hãy bắt đầu thêm chi nhánh đầu tiên của bạn.</p>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} /> Thêm chi nhánh
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {branches.map((branch) => {
              const defaultBannerGradient = "linear-gradient(135deg, hsl(221, 83%, 60%) 0%, hsl(260, 80%, 55%) 100%)";
              
              // Inheritance Fallback Logic
              const finalBrandName = branch.brandName || tenantInfo?.brandName || tenantInfo?.name || "Chi nhánh";
              const finalSlogan = branch.slogan || tenantInfo?.slogan || "";
              const finalLogoUrl = branch.logoUrl || tenantInfo?.logoUrl || "";
              const finalBannerUrl = branch.bannerUrl || tenantInfo?.bannerUrl || "";
              const finalHotline = branch.hotline || tenantInfo?.hotline || "";
              const finalPhone = branch.phone || tenantInfo?.phone || "";
              const finalEmail = branch.email || tenantInfo?.email || "";
              const finalWebsiteUrl = branch.websiteUrl || tenantInfo?.websiteUrl || "";
              const finalFanpageUrl = branch.fanpageUrl || tenantInfo?.fanpageUrl || "";
              const finalInstagramUrl = branch.instagramUrl || tenantInfo?.instagramUrl || "";
              const finalTiktokUrl = branch.tiktokUrl || tenantInfo?.tiktokUrl || "";
              
              const isBrandNameInherited = !branch.brandName && (tenantInfo?.brandName || tenantInfo?.name);
              const isSloganInherited = !branch.slogan && tenantInfo?.slogan;
              const isLogoInherited = !branch.logoUrl && tenantInfo?.logoUrl;
              const isBannerInherited = !branch.bannerUrl && tenantInfo?.bannerUrl;
              const isHotlineInherited = !branch.hotline && tenantInfo?.hotline;
              const isPhoneInherited = !branch.phone && tenantInfo?.phone;
              const isEmailInherited = !branch.email && tenantInfo?.email;
              const isWebsiteInherited = !branch.websiteUrl && tenantInfo?.websiteUrl;
              const isFanpageInherited = !branch.fanpageUrl && tenantInfo?.fanpageUrl;
              const isInstagramInherited = !branch.instagramUrl && tenantInfo?.instagramUrl;
              const isTiktokInherited = !branch.tiktokUrl && tenantInfo?.tiktokUrl;

              const bannerBg = finalBannerUrl ? `url(${finalBannerUrl})` : defaultBannerGradient;

              return (
                <div key={branch.id} className="branch-card animate-fade-in">
                  
                  {/* Hidden inputs for branch */}
                  <input type="file" id={`branch-logo-input-${branch.id}`} accept="image/*" style={{ display: "none" }} onChange={(e) => handleUploadBranchLogo(branch, e)} />
                  <input type="file" id={`branch-banner-input-${branch.id}`} accept="image/*" style={{ display: "none" }} onChange={(e) => handleUploadBranchBanner(branch, e)} />

                  {/* Banner */}
                  <div className="branch-banner" style={{ background: bannerBg, backgroundSize: "cover", backgroundPosition: "center" }}>
                    
                    {/* Branch Banner edit controls */}
                    <button className="banner-upload-btn" style={{ padding: "4px 8px", fontSize: "10.5px", right: "8px", bottom: "8px" }} onClick={() => document.getElementById(`branch-banner-input-${branch.id}`)?.click()}>
                      <Camera size={12} />
                    </button>
                    {branch.bannerUrl && (
                      <button 
                        className="banner-upload-btn" 
                        title="Quay lại dùng ảnh bìa thương hiệu"
                        style={{ padding: "4px 8px", fontSize: "10.5px", right: "44px", bottom: "8px", background: "rgba(239, 68, 68, 0.85)" }} 
                        onClick={() => updateBranchField(branch, { bannerUrl: null })}
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}

                    {/* Logo container overlay (Facebook style) */}
                    <div 
                      className="logo-container branch-logo-container" 
                      title={isLogoInherited ? "Logo thừa kế từ thương hiệu (Click để tải lên đè)" : "Logo riêng chi nhánh (Click để thay đổi)"}
                      onClick={() => document.getElementById(`branch-logo-input-${branch.id}`)?.click()}
                    >
                      {finalLogoUrl ? (
                        <img src={finalLogoUrl} alt="Logo" className="branch-logo-image" />
                      ) : (
                        <Building2 size={24} style={{ color: "var(--color-primary)" }} />
                      )}
                      <div className="logo-upload-overlay">
                        <Camera size={14} />
                      </div>
                    </div>
                    
                    {branch.logoUrl && (
                      <button 
                        title="Quay lại dùng logo thương hiệu"
                        onClick={() => updateBranchField(branch, { logoUrl: null })}
                        style={{
                          position: "absolute",
                          left: "64px",
                          bottom: "-38px",
                          background: "var(--color-danger)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 11,
                          boxShadow: "var(--shadow-sm)"
                        }}
                      >
                        <RotateCcw size={10} />
                      </button>
                    )}
                  </div>

                  {/* Card Content with padded area */}
                  <div style={{ padding: "44px 20px 20px 20px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                    <div>
                      {/* Name & Slogan */}
                      <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>
                        {branch.name}
                      </h3>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <span style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--color-primary)" }}>
                          {finalBrandName}
                        </span>
                        {isBrandNameInherited && (
                          <span style={{ fontSize: "9.5px", color: "var(--text-muted)", fontStyle: "italic", border: "1px dashed var(--border-color)", padding: "0px 4px", borderRadius: "3px" }} title="Tên thương hiệu thừa kế từ tổng công ty">Kế thừa</span>
                        )}
                      </div>
                      
                      {finalSlogan && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                          <span style={{ fontSize: "12px", fontStyle: "italic", color: "var(--text-muted)" }}>
                            "{finalSlogan}"
                          </span>
                          {isSloganInherited && (
                            <span style={{ fontSize: "9.5px", color: "var(--text-muted)", fontStyle: "italic" }} title="Slogan thừa kế từ tổng công ty">(kế thừa)</span>
                          )}
                        </div>
                      )}

                      {/* Contact Info */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-secondary)", marginTop: "12px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          <MapPin size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span style={{ fontSize: "12.5px", lineHeight: "1.4" }}>{branch.address || "Chưa thiết lập địa chỉ"}</span>
                        </div>
                        {finalHotline && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", background: "var(--color-danger-light)", color: "var(--color-danger)", padding: "2px 6px", borderRadius: "4px" }}>
                              HOTLINE
                            </span>
                            <span style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--color-danger)" }}>
                              {finalHotline}
                              {isHotlineInherited && <span style={{ fontSize: "10px", fontWeight: "400", color: "var(--text-muted)", fontStyle: "italic" }}> (kế thừa)</span>}
                            </span>
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Phone size={15} style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: "12.5px" }}>
                            {finalPhone || "Chưa thiết lập điện thoại"}
                            {isPhoneInherited && <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}> (thương hiệu)</span>}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Mail size={15} style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: "12.5px" }}>
                            {finalEmail || "Chưa thiết lập email"}
                            {isEmailInherited && <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}> (thương hiệu)</span>}
                          </span>
                        </div>
                      </div>

                      {/* Social Media public Links */}
                      {(finalWebsiteUrl || finalFanpageUrl || finalInstagramUrl || finalTiktokUrl) && (
                        <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px dashed var(--border-color)" }}>
                          {finalWebsiteUrl && (
                            <a href={finalWebsiteUrl} target="_blank" rel="noreferrer" title={`Website${isWebsiteInherited ? " (Kế thừa từ thương hiệu)" : ""}`} className="social-link">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                              </svg>
                            </a>
                          )}
                          {finalFanpageUrl && (
                            <a href={finalFanpageUrl} target="_blank" rel="noreferrer" title={`Facebook Fanpage${isFanpageInherited ? " (Kế thừa từ thương hiệu)" : ""}`} className="social-link">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                              </svg>
                            </a>
                          )}
                          {finalInstagramUrl && (
                            <a href={finalInstagramUrl} target="_blank" rel="noreferrer" title={`Instagram${isInstagramInherited ? " (Kế thừa từ thương hiệu)" : ""}`} className="social-link">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                              </svg>
                            </a>
                          )}
                          {finalTiktokUrl && (
                            <a href={finalTiktokUrl} target="_blank" rel="noreferrer" title={`TikTok${isTiktokInherited ? " (Kế thừa từ thương hiệu)" : ""}`} className="social-link">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}>
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.95-1.72-.01 2.92.01 5.84-.02 8.75-.1 1.6-.54 3.19-1.45 4.51-1.48 2.21-4.2 3.47-6.85 3.14-3.23-.33-5.91-3.09-5.9-6.36.02-3.53 3.13-6.52 6.69-6.07.13.02.26.05.38.08v4.19c-.83-.3-1.79-.19-2.51.35-.78.53-1.18 1.5-1.07 2.44.13 1.34 1.45 2.37 2.78 2.11 1.11-.15 1.86-1.13 1.88-2.22V.02z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "12px", height: "30px" }}
                        onClick={() => handleOpenEditModal(branch)}
                      >
                        <Edit2 size={13} /> Sửa
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "6px 12px", fontSize: "12px", height: "30px" }}
                        onClick={() => handleDelete(branch.id)}
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brand Modal Dialog */}
      {isBrandModalOpen && (
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
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsBrandModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
              Thiết lập thương hiệu chung
            </h2>
            <form onSubmit={handleSaveBrand}>
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsBrandModalOpen(false)} style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                  Lưu thương hiệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Modal Dialog */}
      {isModalOpen && (
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
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
              {modalMode === "create" ? "Thêm chi nhánh mới" : "Chỉnh sửa chi nhánh"}
            </h2>
            <form onSubmit={handleSave}>
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
