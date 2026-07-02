import React from "react";
import { MapPin, Phone, Mail, Camera, Building2, RotateCcw, Edit2, Trash2 } from "lucide-react";

import { Branch, TenantInfo } from "./types";

import styles from "./Branches.module.css";

interface BranchCardProps {
  branch: Branch;
  tenantInfo: TenantInfo | null;
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
    <div className={`${styles["branch-card"]} animate-fade-in`}>
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
      <div className={styles["branch-banner"]} style={{ background: bannerBg }}>
        {/* Branch Banner edit controls */}
        <button
          className={styles["banner-upload-btn"]}
          style={{ padding: "4px 8px", fontSize: "10.5px", right: "8px", bottom: "8px" }}
          onClick={() => document.getElementById(`branch-banner-input-${branch.id}`)?.click()}
        >
          <Camera size={12} />
        </button>
        {branch.bannerUrl && (
          <button
            type="button"
            className={styles["banner-upload-btn"]}
            title="Quay lại dùng ảnh bìa thương hiệu"
            style={{
              padding: "4px 8px",
              fontSize: "10.5px",
              right: "44px",
              bottom: "8px",
              background: "rgba(239, 68, 68, 0.85)",
            }}
            onClick={() => onResetBanner(branch)}
          >
            <RotateCcw size={12} />
          </button>
        )}

        {/* Logo container overlay (Facebook style) */}
        <div
          className={`${styles["logo-container"]} ${styles["branch-logo-container"]}`}
          title={
            isLogoInherited
              ? "Logo thừa kế từ thương hiệu (Click để tải lên đè)"
              : "Logo riêng chi nhánh (Click để thay đổi)"
          }
          onClick={() => document.getElementById(`branch-logo-input-${branch.id}`)?.click()}
        >
          {finalLogoUrl ? (
            <img src={finalLogoUrl} alt="Logo" className={styles["branch-logo-image"]} />
          ) : (
            <Building2 size={24} style={{ color: "var(--color-primary)" }} />
          )}
          <div className={styles["logo-upload-overlay"]}>
            <Camera size={14} />
          </div>
        </div>

        {branch.logoUrl && (
          <button
            type="button"
            title="Quay lại dùng logo thương hiệu"
            onClick={() => onResetLogo(branch)}
            className={styles.branchLogoResetBtn}
          >
            <RotateCcw size={10} />
          </button>
        )}
      </div>

      {/* Card Content with padded area */}
      <div className={styles.branchCardContent}>
        <div>
          {/* Name & Slogan */}
          <h3 className={styles.branchName}>{branch.name}</h3>

          <div className={styles.branchBrandRow}>
            <span className={styles.branchBrandName}>{finalBrandName}</span>
            {isBrandNameInherited && (
              <span className={styles.inheritanceTag} title="Tên thương hiệu thừa kế từ tổng công ty">
                Kế thừa
              </span>
            )}
          </div>

          {finalSlogan && (
            <div className={styles.branchSloganRow}>
              <span className={styles.branchSlogan}>"{finalSlogan}"</span>
              {isSloganInherited && (
                <span className={styles.branchSloganInherit} title="Slogan thừa kế từ tổng công ty">
                  (kế thừa)
                </span>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className={styles.branchContactList}>
            <div className={styles.branchContactItem}>
              <MapPin size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span className={styles.branchContactText}>
                {branch.address || "Chưa thiết lập địa chỉ"}
              </span>
            </div>
            {finalHotline && (
              <div className={styles.branchContactItem}>
                <span className={styles.branchHotlineBadge}>HOTLINE</span>
                <span className={styles.branchHotlineText}>
                  {finalHotline}
                  {isHotlineInherited && (
                    <span style={{ fontSize: "10px", fontWeight: "400", color: "var(--text-muted)", fontStyle: "italic" }}>
                      {" "}
                      (kế thừa)
                    </span>
                  )}
                </span>
              </div>
            )}
            <div className={styles.branchContactItem}>
              <Phone size={15} style={{ flexShrink: 0 }} />
              <span className={styles.branchContactText}>
                {finalPhone || "Chưa thiết lập điện thoại"}
                {isPhoneInherited && (
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                    {" "}
                    (thương hiệu)
                  </span>
                )}
              </span>
            </div>
            <div className={styles.branchContactItem}>
              <Mail size={15} style={{ flexShrink: 0 }} />
              <span className={styles.branchContactText}>
                {finalEmail || "Chưa thiết lập email"}
                {isEmailInherited && (
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                    {" "}
                    (thương hiệu)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Social Media public Links */}
          {(finalWebsiteUrl || finalFanpageUrl || finalInstagramUrl || finalTiktokUrl) && (
            <div className={styles.branchSocialRow}>
              {finalWebsiteUrl && (
                <a
                  href={finalWebsiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`Website${isWebsiteInherited ? " (Kế thừa từ thương hiệu)" : ""}`}
                  className={styles["social-link"]}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: "block" }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
              )}
              {finalFanpageUrl && (
                <a
                  href={finalFanpageUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`Facebook Fanpage${isFanpageInherited ? " (Kế thừa từ thương hiệu)" : ""}`}
                  className={styles["social-link"]}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: "block" }}
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {finalInstagramUrl && (
                <a
                  href={finalInstagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`Instagram${isInstagramInherited ? " (Kế thừa từ thương hiệu)" : ""}`}
                  className={styles["social-link"]}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: "block" }}
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {finalTiktokUrl && (
                <a
                  href={finalTiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`TikTok${isTiktokInherited ? " (Kế thừa từ thương hiệu)" : ""}`}
                  className={styles["social-link"]}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ display: "block" }}
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.95-1.72-.01 2.92.01 5.84-.02 8.75-.1 1.6-.54 3.19-1.45 4.51-1.48 2.21-4.2 3.47-6.85 3.14-3.23-.33-5.91-3.09-5.9-6.36.02-3.53 3.13-6.52 6.69-6.07.13.02.26.05.38.08v4.19c-.83-.3-1.79-.19-2.51.35-.78.53-1.18 1.5-1.07 2.44.13 1.34 1.45 2.37 2.78 2.11 1.11-.15 1.86-1.13 1.88-2.22V.02z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.branchActionsRow}>
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

