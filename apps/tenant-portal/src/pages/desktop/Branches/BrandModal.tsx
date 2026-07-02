import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

import { TenantInfo } from "./types";

import styles from "./Branches.module.css";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantInfo: TenantInfo | null;
  onSave: (payload: Partial<TenantInfo>) => Promise<void>;
}

export default function BrandModal({ isOpen, onClose, tenantInfo, onSave }: BrandModalProps) {
  const [brandNameText, setBrandNameText] = useState("");
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
        slogan: brandSloganInput || undefined,
        logoUrl: brandLogoInput || undefined,
        bannerUrl: brandBannerInput || undefined,
        hotline: brandHotlineInput || undefined,
        email: brandEmailInput || undefined,
        address: brandAddressInput || undefined,
        fanpageUrl: brandFanpageInput || undefined,
        instagramUrl: brandInstagramInput || undefined,
        tiktokUrl: brandTiktokInput || undefined,
        websiteUrl: brandWebsiteInput || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || "Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`card animate-fade-in ${styles.modalCard}`}>
        <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className={styles.modalTitle}>Thiết lập thương hiệu chung</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalScrollBody}>
            {/* Section 1: Basic Info */}
            <h4 className={styles.sectionHeaderFirst}>Thông tin thương hiệu gốc</h4>
            <div className={styles.formGrid1Col}>
              <div className={`form-group ${styles.formGroup0Margin}`}>
                <label className="form-label">Tên tổng công ty / Thương hiệu gốc *</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  required
                  value={brandNameText}
                  onChange={(e) => setBrandNameText(e.target.value)}
                  placeholder="Ví dụ: Công ty Cổ phần Salon VIP"
                />
              </div>
              <div className={`form-group ${styles.formGroup0Margin}`}>
                <label className="form-label">Slogan thương hiệu</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={brandSloganInput}
                  onChange={(e) => setBrandSloganInput(e.target.value)}
                  placeholder="Ví dụ: Tỏa sáng vẻ đẹp Việt"
                />
              </div>
            </div>

            {/* Section 3: Contact */}
            <h4 className={styles.sectionHeader}>Liên hệ chung</h4>
            <div className={styles.formGrid2Col}>
              <div className={`form-group ${styles.formGroup0Margin}`}>
                <label className="form-label">Hotline chung</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={brandHotlineInput}
                  onChange={(e) => setBrandHotlineInput(e.target.value)}
                  placeholder="Hotline cskh toàn hệ thống"
                />
              </div>
              <div className={`form-group ${styles.formGroup0Margin}`}>
                <label className="form-label">Email liên hệ chung</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="email"
                  value={brandEmailInput}
                  onChange={(e) => setBrandEmailInput(e.target.value)}
                  placeholder="Email chăm sóc khách hàng toàn hệ thống"
                />
              </div>
              <div className={`form-group ${styles.formGroup0Margin} ${styles.gridColSpan2}`}>
                <label className="form-label">Trụ sở chính</label>
                <textarea
                  className={`form-input ${styles.textareaNoResize}`}
                  rows={2}
                  value={brandAddressInput}
                  onChange={(e) => setBrandAddressInput(e.target.value)}
                  placeholder="Địa chỉ trụ sở chính của thương hiệu..."
                />
              </div>
            </div>

            {/* Section 4: Public social links */}
            <h4 className={styles.sectionHeader}>Kênh truyền thông chung</h4>
            <div className={styles.formGrid2Col}>
              <div className="form-group">
                <label className="form-label">Link Fanpage (Facebook)</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={brandFanpageInput}
                  onChange={(e) => setBrandFanpageInput(e.target.value)}
                  placeholder="https://facebook.com/brand"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link Instagram</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={brandInstagramInput}
                  onChange={(e) => setBrandInstagramInput(e.target.value)}
                  placeholder="https://instagram.com/brand"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link TikTok</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={brandTiktokInput}
                  onChange={(e) => setBrandTiktokInput(e.target.value)}
                  placeholder="https://tiktok.com/@brand"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Website thương hiệu</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={brandWebsiteInput}
                  onChange={(e) => setBrandWebsiteInput(e.target.value)}
                  placeholder="https://brand.com"
                />
              </div>
            </div>
          </div>

          <div className={styles.modalActionsRow}>
            <button
              type="button"
              className={`btn btn-secondary ${styles.modalBtn}`}
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${styles.modalBtn}`}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu thương hiệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

