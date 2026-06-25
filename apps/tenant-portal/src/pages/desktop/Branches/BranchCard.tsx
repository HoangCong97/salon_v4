import React from "react";
import { MapPin, Phone, Mail, Camera, Building2, RotateCcw, Edit2, Trash2 } from "lucide-react";
import { Branch } from "./types";

interface BranchCardProps {
  branch: Branch;
  tenantInfo: any;
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
  onUploadLogo: (branch: Branch, e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadBanner: (branch: Branch, e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetLogo: (branch: Branch) => void;
  onResetBanner: (branch: Branch) => void;
}

export default function BranchCard({
  branch,
  tenantInfo,
  onEdit,
  onDelete,
  onUploadLogo,
  onUploadBanner,
  onResetLogo,
  onResetBanner,
}: BranchCardProps) {
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
    <div className="branch-card animate-fade-in">
      {/* Hidden inputs for branch */}
      <input 
        type="file" 
        id={`branch-logo-input-${branch.id}`} 
        accept="image/*" 
        style={{ display: "none" }} 
        onChange={(e) => onUploadLogo(branch, e)} 
      />
      <input 
        type="file" 
        id={`branch-banner-input-${branch.id}`} 
        accept="image/*" 
        style={{ display: "none" }} 
        onChange={(e) => onUploadBanner(branch, e)} 
      />

      {/* Banner */}
      <div className="branch-banner" style={{ background: bannerBg, backgroundSize: "cover", backgroundPosition: "center" }}>
        
        {/* Branch Banner edit controls */}
        <button className="banner-upload-btn" style={{ padding: "4px 8px", fontSize: "10.5px", right: "8px", bottom: "8px" }} onClick={() => document.getElementById(`branch-banner-input-${branch.id}`)?.click()}>
          <Camera size={12} />
        </button>
        {branch.bannerUrl && (
          <button 
            type="button"
            className="banner-upload-btn" 
            title="Quay lại dùng ảnh bìa thương hiệu"
            style={{ padding: "4px 8px", fontSize: "10.5px", right: "44px", bottom: "8px", background: "rgba(239, 68, 68, 0.85)" }} 
            onClick={() => onResetBanner(branch)}
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
            type="button"
            title="Quay lại dùng logo thương hiệu"
            onClick={() => onResetLogo(branch)}
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
            type="button"
            className="btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: "12px", height: "30px" }}
            onClick={() => onEdit(branch)}
          >
            <Edit2 size={13} /> Sửa
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ padding: "6px 12px", fontSize: "12px", height: "30px" }}
            onClick={() => onDelete(branch.id)}
          >
            <Trash2 size={13} /> Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
