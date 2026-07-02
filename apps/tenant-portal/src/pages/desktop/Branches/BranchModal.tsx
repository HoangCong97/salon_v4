import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

import { Branch, ModalMode, TenantInfo } from "./types";

import styles from "./Branches.module.css";

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  branch: Branch | null;
  tenantInfo: TenantInfo | null;
  onSave: (payload: Partial<Branch>) => Promise<void>;
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
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        brandName: brandName || undefined,
        slogan: slogan || undefined,
        logoUrl: logoUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        hotline: hotline || undefined,
        fanpageUrl: fanpageUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        tiktokUrl: tiktokUrl || undefined,
        websiteUrl: websiteUrl || undefined,
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
        <h2 className={styles.modalTitle}>
          {mode === "create" ? "Thêm chi nhánh mới" : "Chỉnh sửa chi nhánh"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalScrollBody}>
            {/* Section 1: Basic Info */}
            <h4 className={styles.sectionHeaderFirst}>Thông tin cơ bản</h4>
            <div className={styles.formGrid1Col}>
              <div className={`form-group ${styles.formGroup0Margin}`}>
                <label className="form-label">Tên chi nhánh *</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Chi nhánh Quận 1"
                />
              </div>
              <div className={`form-group ${styles.formGroup0Margin}`}>
                <label className="form-label">Slogan riêng</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder={tenantInfo?.slogan ? `Kế thừa: ${tenantInfo.slogan}` : "Để trống để kế thừa"}
                />
              </div>
            </div>

            {/* Section 3: Contact details */}
            <h4 className={styles.sectionHeader}>Thông tin liên hệ riêng</h4>
            <div className={styles.formGrid2Col}>
              <div className="form-group">
                <label className="form-label">Số Hotline riêng (Công khai)</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  placeholder={tenantInfo?.hotline ? `Kế thừa: ${tenantInfo.hotline}` : "Để trống để kế thừa"}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Điện thoại chi nhánh</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={tenantInfo?.phone ? `Kế thừa: ${tenantInfo.phone}` : "Điện thoại CSKH riêng"}
                />
              </div>
              <div className={`form-group ${styles.gridColSpan2}`}>
                <label className="form-label">Email liên hệ riêng</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tenantInfo?.email ? `Kế thừa: ${tenantInfo.email}` : "Email CSKH riêng"}
                />
              </div>
              <div className={`form-group ${styles.gridColSpan2}`}>
                <label className="form-label">Địa chỉ chi nhánh *</label>
                <textarea
                  className={`form-input ${styles.textareaNoResize}`}
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, quận, thành phố..."
                />
              </div>
            </div>

            {/* Section 4: Public social links */}
            <h4 className={styles.sectionHeader}>Mạng xã hội & Kênh truyền thông riêng</h4>
            <div className={styles.formGrid2Col}>
              <div className="form-group">
                <label className="form-label">Link Fanpage riêng (Facebook)</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={fanpageUrl}
                  onChange={(e) => setFanpageUrl(e.target.value)}
                  placeholder={tenantInfo?.fanpageUrl ? `Kế thừa: ${tenantInfo.fanpageUrl}` : "https://facebook.com/..."}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link Instagram riêng</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder={tenantInfo?.instagramUrl ? `Kế thừa: ${tenantInfo.instagramUrl}` : "https://instagram.com/..."}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link TikTok riêng</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder={tenantInfo?.tiktokUrl ? `Kế thừa: ${tenantInfo.tiktokUrl}` : "https://tiktok.com/@..."}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link Website riêng</label>
                <input
                  className={`form-input ${styles.formInputHeight}`}
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder={tenantInfo?.websiteUrl ? `Kế thừa: ${tenantInfo.websiteUrl}` : "https://www.example.com"}
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
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

