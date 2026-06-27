import React, { useState, useEffect } from "react";
import { formatCurrencyVND } from "@salon/shared-utils";

import { TenantData, PlanData } from "./types";
import { TenantKPIs } from "./components/TenantKPIs";
import { TenantFilters } from "./components/TenantFilters";
import { TenantTable } from "./components/TenantTable";
import { TenantDrawer } from "./components/TenantDrawer";
import { TenantModals } from "./components/TenantModals";

const Tenants: React.FC = () => {
  // Database States
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Tenant details for Drawer
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [drawerTab, setDrawerTab] = useState<"general" | "invoices">("general");
  const [tenantInvoices, setTenantInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Filters State
  const [filterPlan, setFilterPlan] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals visibility toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);

  // Impersonate transition steps
  const [impersonateStep, setImpersonateStep] = useState(0);
  const [targetImpersonateName, setTargetImpersonateName] = useState("");

  // Form State for creating a new Salon
  const [newSalon, setNewSalon] = useState({
    name: "",
    owner: "",
    phone: "",
    email: "",
    plan: "FREE",
    address: "",
  });

  // Form State for editing an existing Salon
  const [editingTenant, setEditingTenant] = useState<TenantData | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    owner: "",
    phone: "",
    email: "",
    address: "",
  });

  // Form State for plan updating
  const [tempPlan, setTempPlan] = useState<string>("FREE");

  // Tenant marked for deletion
  const [tenantToDelete, setTenantToDelete] = useState<TenantData | null>(null);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPlan, filterStatus, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch plans first
      const plansRes = await fetch(
        "http://localhost:3000/api/super-admin/plans",
      );
      let loadedPlans: PlanData[] = [];
      if (plansRes.ok) {
        loadedPlans = await plansRes.json();
        setPlans(loadedPlans);
      }

      // Fetch tenants
      const tenantsRes = await fetch(
        "http://localhost:3000/api/super-admin/tenants",
      );
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData);
      }
    } catch (error) {
      console.error("Failed to fetch administration data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch invoices for the selected tenant when Tab shifts to invoices
  const fetchTenantInvoices = async (tenantId: string) => {
    try {
      setLoadingInvoices(true);
      const res = await fetch(
        `http://localhost:3000/api/super-admin/tenants/${tenantId}/invoices`,
      );
      if (res.ok) {
        const data = await res.json();
        setTenantInvoices(data);
      }
    } catch (error) {
      console.error("Failed to fetch tenant invoices:", error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (selectedTenant) {
      if (drawerTab === "invoices") {
        fetchTenantInvoices(selectedTenant.id);
      }
    } else {
      setDrawerTab("general");
      setTenantInvoices([]);
    }
  }, [selectedTenant, drawerTab]);

  // Map plan code to a beautiful badge and title
  const getPlanDetails = (planCode: string) => {
    const code = (planCode || "FREE").toUpperCase();
    const plan = plans.find((p) => p.code.toUpperCase() === code);

    if (code === "FREE") {
      return {
        name: "Dùng thử (Free)",
        bgColor: "hsl(210, 20%, 90%)",
        color: "hsl(215, 25%, 35%)",
        price: 0,
      };
    }
    if (code === "PREMIUM") {
      return {
        name: plan ? plan.name : "Premium",
        bgColor: "var(--color-primary-light)",
        color: "var(--color-primary)",
        price: plan ? Number(plan.price) : 799000,
      };
    }
    if (code === "PLUS") {
      return {
        name: plan ? plan.name : "Plus",
        bgColor: "var(--color-info-light)",
        color: "var(--color-info)",
        price: plan ? Number(plan.price) : 349000,
      };
    }
    if (code === "BASIC") {
      return {
        name: plan ? plan.name : "Basic",
        bgColor: "var(--color-warning-light)",
        color: "var(--color-warning)",
        price: plan ? Number(plan.price) : 199000,
      };
    }

    return {
      name: plan ? plan.name : planCode,
      bgColor: "var(--border-color)",
      color: "var(--text-secondary)",
      price: plan ? Number(plan.price) : 0,
    };
  };

  const toggleTenantStatus = async (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    if (!tenant) return;
    const newStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(
        `http://localhost:3000/api/super-admin/tenants/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        setTenants((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              const updatedObj = { ...t, status: updated.status };
              if (selectedTenant && selectedTenant.id === id) {
                setSelectedTenant(updatedObj);
              }
              return updatedObj;
            }
            return t;
          }),
        );
      }
    } catch (error) {
      console.error("Failed to toggle tenant status:", error);
    }
  };

  const handleCreateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalon.name || !newSalon.owner || !newSalon.phone) {
      alert("Vui lòng nhập tên salon, tên chủ sở hữu và số điện thoại!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/super-admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSalon.name,
          owner: newSalon.owner,
          phone: newSalon.phone,
          email: newSalon.email,
          plan: newSalon.plan,
          address: newSalon.address,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setTenants((prev) => [created, ...prev]);
        setShowAddModal(false);
        setNewSalon({
          name: "",
          owner: "",
          phone: "",
          email: "",
          plan: "FREE",
          address: "",
        });
      } else {
        alert("Lỗi khi thêm Salon mới!");
      }
    } catch (error) {
      console.error("Failed to create tenant:", error);
    }
  };

  const openEditModal = (tenant: TenantData) => {
    setEditingTenant(tenant);
    setEditForm({
      name: tenant.name,
      owner: tenant.owner,
      phone: tenant.phone,
      email: tenant.email,
      address: tenant.address,
    });
    setShowEditModal(true);
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/super-admin/tenants/${editingTenant.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name,
            owner: editForm.owner,
            phone: editForm.phone,
            email: editForm.email,
            address: editForm.address,
          }),
        },
      );

      if (res.ok) {
        const updated = await res.json();
        setTenants((prev) =>
          prev.map((t) => (t.id === editingTenant.id ? updated : t)),
        );
        if (selectedTenant && selectedTenant.id === editingTenant.id) {
          setSelectedTenant(updated);
        }
        setShowEditModal(false);
        setEditingTenant(null);
      } else {
        alert("Lỗi khi cập nhật thông tin Salon!");
      }
    } catch (error) {
      console.error("Failed to update tenant:", error);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedTenant) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/super-admin/tenants/${selectedTenant.id}/plan`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planCode: tempPlan.toUpperCase() }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        setTenants((prev) =>
          prev.map((t) => (t.id === selectedTenant.id ? updated : t)),
        );
        setSelectedTenant(updated);
        setShowPlanModal(false);
      }
    } catch (error) {
      console.error("Failed to update tenant plan:", error);
    }
  };

  const confirmDeleteTenant = (tenant: TenantData) => {
    setTenantToDelete(tenant);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/super-admin/tenants/${tenantToDelete.id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setTenants((prev) => prev.filter((t) => t.id !== tenantToDelete.id));
        if (selectedTenant && selectedTenant.id === tenantToDelete.id) {
          setSelectedTenant(null);
        }
        setShowDeleteConfirmModal(false);
        setTenantToDelete(null);
      } else {
        alert("Không thể xóa Salon!");
      }
    } catch (error) {
      console.error("Failed to delete tenant:", error);
    }
  };

  const triggerImpersonate = (name: string) => {
    setTargetImpersonateName(name);
    setImpersonateStep(0);
    setShowImpersonateModal(true);

    // Multistep premium transition loader simulation
    setTimeout(() => setImpersonateStep(1), 700);
    setTimeout(() => setImpersonateStep(2), 1400);
    setTimeout(() => {
      setImpersonateStep(3);
      setTimeout(() => {
        setShowImpersonateModal(false);
        // Automatically redirects to local portal in a new tab
        window.open("http://localhost:3002", "_blank");
      }, 1000);
    }, 2100);
  };

  // Filter salons logic
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan =
      filterPlan === "ALL" || t.plan.toUpperCase() === filterPlan.toUpperCase();
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Dynamic calculations for KPI stats cards
  const totalTenantsCount = tenants.length;
  const activeTenantsCount = tenants.filter(
    (t) => t.status === "ACTIVE",
  ).length;
  const suspendedTenantsCount = tenants.filter(
    (t) => t.status === "SUSPENDED",
  ).length;

  const mrr = tenants
    .filter((t) => t.status === "ACTIVE")
    .reduce((sum, t) => sum + getPlanDetails(t.plan).price, 0);

  // Pagination logic
  const totalRecords = filteredTenants.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        height: "100%",
      }}
    >
      {/* KPIs Section */}
      <TenantKPIs
        mrr={mrr}
        totalTenantsCount={totalTenantsCount}
        activeTenantsCount={activeTenantsCount}
        suspendedTenantsCount={suspendedTenantsCount}
      />

      {/* Filter and search action bar */}
      <TenantFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterPlan={filterPlan}
        setFilterPlan={setFilterPlan}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        plans={plans}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {/* Main Table view */}
      <TenantTable
        loading={loading}
        paginatedTenants={paginatedTenants}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        filteredTenantsLength={totalRecords}
        getPlanDetails={getPlanDetails}
        onSelectTenant={setSelectedTenant}
        onOpenEditModal={openEditModal}
        onTriggerImpersonate={triggerImpersonate}
        onToggleStatus={toggleTenantStatus}
        onConfirmDelete={confirmDeleteTenant}
      />

      {/* Detail Drawer overlay with React Portal */}
      <TenantDrawer
        selectedTenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
        drawerTab={drawerTab}
        setDrawerTab={setDrawerTab}
        tenantInvoices={tenantInvoices}
        loadingInvoices={loadingInvoices}
        getPlanDetails={getPlanDetails}
        onTriggerImpersonate={triggerImpersonate}
        onOpenEditModal={(t) => {
          setSelectedTenant(null);
          openEditModal(t);
        }}
        onOpenPlanModal={(t) => {
          setTempPlan(t.plan);
          setShowPlanModal(true);
        }}
        onToggleStatus={toggleTenantStatus}
        onConfirmDelete={(t) => {
          setSelectedTenant(null);
          confirmDeleteTenant(t);
        }}
      />

      {/* All Modals */}
      <TenantModals
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newSalon={newSalon}
        setNewSalon={setNewSalon}
        plans={plans}
        handleCreateSalon={handleCreateSalon}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingTenant={editingTenant}
        editForm={editForm}
        setEditForm={setEditForm}
        handleUpdateTenant={handleUpdateTenant}
        showPlanModal={showPlanModal}
        setShowPlanModal={setShowPlanModal}
        selectedTenant={selectedTenant}
        tempPlan={tempPlan}
        setTempPlan={setTempPlan}
        getPlanDetails={getPlanDetails}
        handleUpdatePlan={handleUpdatePlan}
        showDeleteConfirmModal={showDeleteConfirmModal}
        setShowDeleteConfirmModal={setShowDeleteConfirmModal}
        tenantToDelete={tenantToDelete}
        handleDeleteTenant={handleDeleteTenant}
        showImpersonateModal={showImpersonateModal}
        impersonateStep={impersonateStep}
        targetImpersonateName={targetImpersonateName}
      />

      {/* Embedded Animations Styles */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); transform: scale(1); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); transform: scale(1); }
        }
        @keyframes secureScale {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes secureSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Tenants;
