import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, ChevronDown, Check } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useConfirm } from "../desktop/ConfirmDialog";

export default function Header() {
  const { user, branches, currentBranchId, setBranch, logout } = useAuthStore();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Đăng xuất tài khoản",
      message: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      type: "warning",
      confirmText: "Đăng xuất",
      cancelText: "Hủy bỏ",
    });
    if (ok) {
      logout();
    }
  };

  const currentBranch = branches.find((b) => b.id === currentBranchId);
  const hasMultipleBranches = branches && branches.length > 1;
  const todayStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Backdrop for closing dropdowns when clicking outside */}
      {(isUserMenuOpen || isBranchMenuOpen) && (
        <div
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsBranchMenuOpen(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 105,
            background: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <header
        className="mobile-header"
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          flexShrink: 0,
          height: "calc(60px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "16px",
          paddingRight: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
          width: "100%",
          zIndex: 106,
          position: "relative",
          boxSizing: "border-box",
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)",
          boxShadow: "0 2px 10px rgba(30, 58, 138, 0.25)",
        }}
      >
        {/* LEFT SIDE: Avatar + 2 Lines (Line 1: Name, Line 2: Role, No Border) */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setIsBranchMenuOpen(false);
              setIsUserMenuOpen((prev) => !prev);
            }}
            title="Tùy chọn tài khoản"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <img
              src={
                user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              }
              alt={user?.name}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(255, 255, 255, 0.6)",
                display: "block",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                minWidth: 0,
              }}
            >
              {/* Line 1: User Name + Chevron */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  maxWidth: "100%",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "17px",
                    color: "#ffffff",
                    maxWidth: "130px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name ? user.name.split(" ").pop() : "Tài khoản"}
                </span>
                <ChevronDown
                  size={15}
                  color="#bfdbfe"
                  style={{
                    transform: isUserMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* Line 2: Role badge with border and smaller size */}
              <span
                style={{
                  fontSize: "9.5px",
                  color: "#ffffff",
                  background: "rgba(255, 255, 255, 0.16)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  display: "inline-block",
                  marginTop: "3px",
                  lineHeight: "13px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.role || "Nhân viên"}
              </span>
            </div>
          </button>

          {/* USER DROPDOWN MENU */}
          {isUserMenuOpen && (
            <div
              className="animate-fade-in"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                width: "210px",
                background: "#ffffff",
                borderRadius: "14px",
                boxShadow:
                  "0 10px 30px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                zIndex: 110,
                padding: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                overflow: "hidden",
              }}
            >
              {/* User Header Info in Menu */}
              <div
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid #f1f5f9",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.name}
                  </span>
                  {user?.role && (
                    <span
                      style={{
                        fontSize: "9.5px",
                        color: "#1d4ed8",
                        fontWeight: "700",
                        background: "#dbeafe",
                        padding: "1.5px 6px",
                        borderRadius: "5px",
                        flexShrink: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
                {user?.email && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.email}
                  </div>
                )}
              </div>

              {/* Menu Item 1: Hồ sơ */}
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate("/profile");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#0284c7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#334155";
                }}
              >
                <User size={16} color="#64748b" />
                <span>Hồ sơ cá nhân</span>
              </button>

              {/* Menu Item 2: Cài đặt */}
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate("/profile");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#0284c7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#334155";
                }}
              >
                <Settings size={16} color="#64748b" />
                <span>Cài đặt</span>
              </button>

              <div
                style={{
                  height: "1px",
                  background: "#f1f5f9",
                  margin: "4px 0",
                }}
              />

              {/* Menu Item 3: Đăng xuất */}
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#ef4444",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <LogOut size={16} color="#ef4444" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Branch (No border) + Date/Time on 2 Parallel Lines */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right",
            maxWidth: "50%",
            minWidth: 0,
          }}
        >
          {/* Line 1: Branch Name (matches font & baseline with user name) */}
          {hasMultipleBranches ? (
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                setIsBranchMenuOpen((prev) => !prev);
              }}
              title="Chuyển đổi chi nhánh"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                maxWidth: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  color: "#ffffff",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                {currentBranch ? currentBranch.name : "Chi nhánh"}
              </span>
              <ChevronDown
                size={15}
                color="#bfdbfe"
                style={{
                  transform: isBranchMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                }}
              />
            </button>
          ) : (
            <span
              style={{
                fontSize: "17px",
                color: "#ffffff",
                fontWeight: "700",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                lineHeight: 1.2,
              }}
            >
              {currentBranch ? currentBranch.name : "Salon App"}
            </span>
          )}

          {/* Line 2: Date & Time (matches font & baseline with user role) */}
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.8)",
              marginTop: "3px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              lineHeight: 1.2,
            }}
          >
            {todayStr}
          </span>

          {/* BRANCH SWITCHER DROPDOWN MENU */}
          {isBranchMenuOpen && hasMultipleBranches && (
            <div
              className="animate-fade-in"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "220px",
                background: "#ffffff",
                borderRadius: "14px",
                boxShadow:
                  "0 10px 30px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                zIndex: 110,
                padding: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "8px 10px",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: "1px solid #f1f5f9",
                  marginBottom: "2px",
                }}
              >
                Chọn chi nhánh
              </div>

              {branches.map((b) => {
                const isSelected = b.id === currentBranchId;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBranch(b.id);
                      localStorage.setItem("branchId", b.id);
                      setIsBranchMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "9px 10px",
                      borderRadius: "8px",
                      border: "none",
                      background: isSelected ? "#eff6ff" : "transparent",
                      color: isSelected ? "#1d4ed8" : "#334155",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: "8px" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? "700" : "500",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {b.name}
                      </div>
                      {b.address && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "1px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {b.address}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
