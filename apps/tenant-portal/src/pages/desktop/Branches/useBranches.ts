import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";
import { Branch, ModalMode, TenantInfo } from "./types";

export function useBranches() {
  const { currentTenantId, setTenant } = useAuthStore();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Modals visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Queries
  const { data: tenantInfo = null, error: tenantError } = useQuery<TenantInfo>({
    queryKey: queryKeys.tenant.info(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}`),
    enabled: !!currentTenantId,
  });

  const {
    data: branches = [],
    isLoading: loading,
    error: branchesError,
  } = useQuery<Branch[]>({
    queryKey: queryKeys.branches.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/branches`),
    enabled: !!currentTenantId,
  });

  const error =
    tenantError || branchesError
      ? ((tenantError || branchesError) as Error).message
      : null;

  const fetchTenantInfo = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.tenant.info(currentTenantId!),
    });
  }, [queryClient, currentTenantId]);

  const fetchBranches = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.branches.list(currentTenantId!),
    });
  }, [queryClient, currentTenantId]);

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

  const handleSaveBrand = async (payload: Partial<TenantInfo>) => {
    try {
      await api.put(`/tenants/${currentTenantId}`, payload);
      toast.success("Cập nhật thông tin thương hiệu thành công!");
      setIsBrandModalOpen(false);
      await fetchTenantInfo();
      await fetchBranches();

      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
      throw err;
    }
  };

  const handleSaveBranch = async (payload: Partial<Branch>) => {
    try {
      if (modalMode === "create") {
        await api.post(`/tenants/${currentTenantId}/branches`, payload);
        toast.success("Thêm chi nhánh mới thành công!");
      } else {
        await api.put(
          `/tenants/${currentTenantId}/branches/${selectedBranch?.id}`,
          payload
        );
        toast.success("Cập nhật chi nhánh thành công!");
      }

      setIsModalOpen(false);
      await fetchBranches();

      // Update global context so branch selector gets updated
      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
      throw err;
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (
      !(await confirm({
        title: "Xóa chi nhánh",
        message: "Bạn có chắc chắn muốn xóa chi nhánh này?",
        type: "danger",
        confirmText: "Xóa",
      }))
    )
      return;

    try {
      await api.delete(`/tenants/${currentTenantId}/branches/${id}`);
      toast.success("Đã xóa chi nhánh thành công!");
      await fetchBranches();

      // Update global context so branch selector gets updated
      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    }
  };

  // Quick Inline Upload Helper for Tenant
  const updateTenantField = async (fields: Partial<TenantInfo>) => {
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
      ...fields,
    };
    try {
      await api.put(`/tenants/${currentTenantId}`, payload);
      toast.success("Cập nhật thương hiệu thành công!");
      await fetchTenantInfo();
      await fetchBranches();
      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    }
  };

  const uploadFile = async (
    base64Data: string,
    category: string,
    originalFilename?: string
  ): Promise<string> => {
    const data = await api.post<{ url: string }>(
      `/tenants/${currentTenantId}/upload`,
      {
        file: base64Data,
        category,
        filename: originalFilename,
      }
    );
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg);
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Inline Upload Helper for Branch
  const updateBranchField = async (branch: Branch, fields: Partial<Branch>) => {
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
      ...fields,
    };
    try {
      await api.put(
        `/tenants/${currentTenantId}/branches/${branch.id}`,
        payload
      );
      toast.success("Cập nhật chi nhánh thành công!");
      await fetchBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    }
  };

  const handleUploadBranchBanner = (
    branch: Branch,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const fileUrl = await uploadFile(base64, "branches", file.name);
        await updateBranchField(branch, { bannerUrl: fileUrl });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBranchLogo = (
    branch: Branch,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const fileUrl = await uploadFile(base64, "branches", file.name);
        await updateBranchField(branch, { logoUrl: fileUrl });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg);
      }
    };
    reader.readAsDataURL(file);
  };

  return {
    tenantInfo,
    branches,
    loading,
    error,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedBranch,
    isBrandModalOpen,
    setIsBrandModalOpen,
    handleOpenBrandModal,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveBrand,
    handleSaveBranch,
    handleDeleteBranch,
    updateTenantField,
    handleUploadTenantBanner,
    handleUploadTenantLogo,
    updateBranchField,
    handleUploadBranchBanner,
    handleUploadBranchLogo,
  };
}
