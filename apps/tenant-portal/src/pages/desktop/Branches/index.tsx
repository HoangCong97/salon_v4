import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { Plus, Loader2, Building2 } from "lucide-react";
import { Branch } from "./types";
import BrandCard from "./BrandCard";
import BrandModal from "./BrandModal";
import BranchCard from "./BranchCard";
import BranchModal from "./BranchModal";

export default function Branches() {
  const { currentTenantId, setTenant } = useAuthStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

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
    setIsBrandModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setModalMode("edit");
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (payload: any) => {
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
      throw err;
    }
  };

  const handleSaveBranch = async (payload: any) => {
    try {
      let res;
      if (modalMode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${selectedBranch?.id}`, {
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
      throw err;
    }
  };

  const handleDeleteBranch = async (id: string) => {
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
          justifyContent: center;
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
          justifyContent: center;
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
          justifyContent: center;
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

      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Brand Card Summary */}
        <BrandCard
          tenantInfo={tenantInfo}
          onOpenBrandModal={handleOpenBrandModal}
          onUploadLogo={handleUploadTenantLogo}
          onUploadBanner={handleUploadTenantBanner}
          onRemoveLogo={() => updateTenantField({ logoUrl: null })}
          onRemoveBanner={() => updateTenantField({ bannerUrl: null })}
        />

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
            {branches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                tenantInfo={tenantInfo}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteBranch}
                onUploadLogo={handleUploadBranchLogo}
                onUploadBanner={handleUploadBranchBanner}
                onResetLogo={(b) => updateBranchField(b, { logoUrl: null })}
                onResetBanner={(b) => updateBranchField(b, { bannerUrl: null })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Brand Modal Dialog */}
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        tenantInfo={tenantInfo}
        onSave={handleSaveBrand}
      />

      {/* Branch Modal Dialog */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        branch={selectedBranch}
        tenantInfo={tenantInfo}
        onSave={handleSaveBranch}
      />
    </>
  );
}
