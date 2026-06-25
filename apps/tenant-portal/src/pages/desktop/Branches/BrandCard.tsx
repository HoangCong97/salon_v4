import React from "react";
import { Camera, Building2, RotateCcw, Edit2 } from "lucide-react";

interface BrandCardProps {
  tenantInfo: any;
  onOpenBrandModal: () => void;
  onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadBanner: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  onRemoveBanner: () => void;
}

export default function BrandCard({
  tenantInfo,
  onOpenBrandModal,
  onUploadLogo,
  onUploadBanner,
  onRemoveLogo,
  onRemoveBanner,
}: BrandCardProps) {
  if (!tenantInfo) return null;

  return (
    <div className="card animate-fade-in" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
      {/* Hidden file inputs for Brand (Tenant) */}
      <input 
        type="file" 
        id="tenant-logo-input" 
        accept="image/*" 
        style={{ display: "none" }} 
        onChange={onUploadLogo} 
      />
      <input 
        type="file" 
        id="tenant-banner-input" 
        accept="image/*" 
        style={{ display: "none" }} 
        onChange={onUploadBanner} 
      />

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
            onClick={onRemoveBanner}
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
            onClick={onRemoveLogo}
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
          <button className="btn btn-secondary" onClick={onOpenBrandModal} style={{ display: "flex", alignItems: "center", gap: "6px", height: "38px" }}>
            <Edit2 size={15} /> Cấu hình bằng biểu mẫu
          </button>
        </div>
      </div>
    </div>
  );
}
