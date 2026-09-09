import React, { useState, useMemo } from "react";
import { X, Filter } from "lucide-react";
import { DailyRevenueItem, InvoiceDetailItem } from "../types";
import { Invoice, Staff } from "../../../desktop/Invoices/types";
import StaffDailyRevenueCard from "../../components/StaffDailyRevenueCard";
import MobileInvoiceList from "../../components/MobileInvoiceList";
import MobileInvoiceDetailModal from "../../components/MobileInvoiceDetailModal";

export interface MonthDetailData {
  yearMonth: string; // e.g. "2026-09"
  gross: number;
  net: number;
  invoices: InvoiceDetailItem[];
}

interface DailyInvoicesModalProps {
  selectedDay?: DailyRevenueItem | null;
  selectedMonth?: MonthDetailData | null;
  staffList?: Staff[];
  onClose: () => void;
  formatShortCurrency?: (val: number) => string;
}

export const DailyInvoicesModal: React.FC<DailyInvoicesModalProps> = ({
  selectedDay,
  selectedMonth,
  staffList,
  onClose,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDetailInvoice, setSelectedDetailInvoice] = useState<Invoice | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const formatDayLabel = (dateRaw?: string) => {
    if (!dateRaw || typeof dateRaw !== "string") return "";
    const parts = dateRaw.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateRaw;
  };

  const formatMonthLabel = (yearMonth?: string) => {
    if (!yearMonth || typeof yearMonth !== "string") return "";
    const parts = yearMonth.split("-");
    if (parts.length === 2) {
      return `Tháng ${parts[1]}/${parts[0]}`;
    }
    return `Tháng ${yearMonth}`;
  };

  const modalTitle = useMemo(() => {
    if (selectedDay) {
      const now = new Date();
      const nowDay = String(now.getDate()).padStart(2, "0");
      const nowMonth = String(now.getMonth() + 1).padStart(2, "0");
      const nowYear = now.getFullYear();
      const todayRaw = `${nowYear}-${nowMonth}-${nowDay}`;
      if (selectedDay.dateRaw === todayRaw) return "Hôm nay";
      return `Ngày ${formatDayLabel(selectedDay.dateRaw)}`;
    }
    if (selectedMonth) {
      return formatMonthLabel(selectedMonth.yearMonth);
    }
    return "";
  }, [selectedDay, selectedMonth]);

  const rawInvoices: InvoiceDetailItem[] = useMemo(() => {
    if (selectedDay && Array.isArray(selectedDay.invoices)) return selectedDay.invoices;
    if (selectedMonth && Array.isArray(selectedMonth.invoices)) return selectedMonth.invoices;
    return [];
  }, [selectedDay, selectedMonth]);

  const modalGross = useMemo(() => {
    if (selectedDay) return selectedDay.totalPrice;
    if (selectedMonth) return selectedMonth.gross;
    return undefined;
  }, [selectedDay, selectedMonth]);

  const modalNet = useMemo(() => {
    if (selectedDay) return selectedDay.finalAmount;
    if (selectedMonth) return selectedMonth.net;
    return undefined;
  }, [selectedDay, selectedMonth]);

  // Smooth exit animation handler
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 220); // 220ms matches animation duration
  };

  // Map invoices to Invoice[] interface to reuse directly in StaffDailyRevenueCard and MobileInvoiceList
  const allInvoices = useMemo((): Invoice[] => {
    return rawInvoices.map((inv) => {
      const timeParts = (inv.time || "00:00").split(":");
      const hour = (timeParts[0] || "00").padStart(2, "0");
      const minute = (timeParts[1] || "00").padStart(2, "0");
      const dateRaw =
        selectedDay?.dateRaw ||
        (selectedMonth ? `${selectedMonth.yearMonth}-01` : new Date().toISOString().slice(0, 10));
      const isoCreatedAt = `${dateRaw}T${hour}:${minute}:00`;

      return {
        id: inv.id || inv.invoiceNumber || String(Math.random()),
        tenantId: "",
        branchId: "",
        customerId: undefined,
        customer: {
          name: inv.customerName || "Khách lẻ",
          phone: "",
        },
        cashierId: inv.cashierId || undefined,
        cashier: {
          name: inv.cashierName || "Thu ngân",
        },
        paymentMethod: (inv.paymentMethod === "BANK_TRANSFER" || inv.paymentMethod === "TRANSFER"
          ? "BANK_TRANSFER"
          : "CASH") as "CASH" | "BANK_TRANSFER",
        orderSource: "WALK_IN",
        totalPrice: Number(inv.totalPrice || 0),
        discountAmount: Number(inv.discountAmount || 0),
        finalAmount: Number(inv.finalAmount || 0),
        status: "COMPLETED",
        createdAt: isoCreatedAt,
        items: Array.isArray(inv.items)
          ? inv.items.map((it) => ({
              id: it.id,
              itemId: it.itemId || it.id,
              itemType: (it.itemType as any) || "SERVICE",
              name: it.name || "Dịch vụ",
              price: Number(it.price || 0),
              quantity: Number(it.quantity || 1),
              discountAmount: Number(it.discountAmount || 0),
              finalAmount: Number(it.finalAmount || 0),
              staffId: it.staffId || undefined,
              stylist: it.staffName
                ? {
                    id: it.staffId || "",
                    name: it.staffName,
                    avatar: it.staffAvatar || undefined,
                  }
                : undefined,
            }))
          : [],
      };
    });
  }, [rawInvoices, selectedDay, selectedMonth]);

  // Filter invoices if a staff member is selected in StaffDailyRevenueCard
  const filteredInvoices = useMemo(() => {
    if (!selectedStaffId) return allInvoices;
    return allInvoices.filter((inv) => {
      const hasItem = inv.items?.some(
        (it) => it.staffId === selectedStaffId || it.stylist?.name === selectedStaffId,
      );
      if (hasItem) return true;
      return (
        inv.cashierId === selectedStaffId || `cashier-${inv.cashier?.name}` === selectedStaffId
      );
    });
  }, [allInvoices, selectedStaffId]);

  // Name of selected staff
  const selectedStaffName = useMemo(() => {
    if (!selectedStaffId) return null;
    for (const inv of allInvoices) {
      const item = inv.items?.find(
        (it) => it.staffId === selectedStaffId || it.stylist?.name === selectedStaffId,
      );
      if (item?.stylist?.name) return item.stylist.name;
      if (inv.cashierId === selectedStaffId || `cashier-${inv.cashier?.name}` === selectedStaffId) {
        return inv.cashier?.name || "Thu ngân";
      }
    }
    return "Nhân viên";
  }, [allInvoices, selectedStaffId]);

  // Safe early return ONLY AFTER all hooks are evaluated
  if (!selectedDay && !selectedMonth) return null;

  return (
    <>
      {/* Modal Backdrop Container */}
      <div
        onClick={handleClose}
        className={`fixed inset-x-0 bottom-0 top-[calc(60px+env(safe-area-inset-top,0px))] z-[105] flex flex-col justify-end bg-black/45 backdrop-blur-xs ${
          isClosing ? "animate-revenue-fade-out pointer-events-none" : "animate-revenue-fade-in"
        }`}
      >
        {/* Modal Full-body Sheet */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl mx-auto bg-white rounded-t-2xl h-full flex flex-col shadow-2xl overflow-hidden ${
            isClosing ? "animate-revenue-slide-down" : "animate-revenue-slide-up"
          }`}
        >
          {/* Header Bar with Title, Pill Handle and Close button */}
          <div className="relative shrink-0 flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1">
              <span className="text-[13.5px] font-bold text-slate-800">
                {selectedDay
                  ? `Chi tiết ngày ${formatDayLabel(selectedDay.dateRaw)}`
                  : `Chi tiết tháng ${formatMonthLabel(selectedMonth?.yearMonth)}`}
              </span>
            </div>

            {/* Centered pill handle */}
            <div className="w-9 h-1 rounded-full bg-slate-300 mx-auto" />

            {/* Circular close button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-full border-0 outline-none bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400 transition-colors shrink-0 p-0"
              aria-label="Đóng modal"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* ================= TRƯỜNG HỢP 1: CHI TIẾT THÁNG (CHỈ CẦN DANH SÁCH NHÂN VIÊN, KHÔNG CẦN HÓA ĐƠN) ================= */}
          {selectedMonth && (
            <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden">
              <StaffDailyRevenueCard
                title={modalTitle}
                todayInvoices={allInvoices}
                totalGross={modalGross}
                totalNet={modalNet}
                staffList={staffList}
                selectedStaffId={selectedStaffId}
                onSelectStaff={setSelectedStaffId}
              />
            </div>
          )}

          {/* ================= TRƯỜNG HỢP 2: CHI TIẾT NGÀY (HIỆN CẢ BẢNG NHÂN VIÊN VÀ DANH SÁCH HÓA ĐƠN) ================= */}
          {selectedDay && (
            <>
              {/* TOP SECTION: Kế thừa StaffDailyRevenueCard */}
              <div className="shrink-0 flex flex-col bg-white">
                <StaffDailyRevenueCard
                  title={modalTitle}
                  todayInvoices={allInvoices}
                  totalGross={modalGross}
                  totalNet={modalNet}
                  staffList={staffList}
                  selectedStaffId={selectedStaffId}
                  onSelectStaff={setSelectedStaffId}
                  maxHeight="160px"
                />
              </div>

              {/* Visual Separator Bar (8px bar identical to Invoices page) */}
              <div className="h-2 bg-[#f1f5f9] border-t border-b border-[#e2e8f0] shrink-0" />

              {/* Staff Filter Active Notice (if any) */}
              {selectedStaffId && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-800 shrink-0">
                  <span className="flex items-center gap-1.5 truncate pr-2">
                    <Filter size={12} className="text-blue-600 shrink-0" />
                    <span className="truncate">
                      Đang lọc theo: <strong>{selectedStaffName}</strong> ({filteredInvoices.length} HĐ)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffId(null)}
                    className="text-[11px] font-bold text-blue-600 hover:underline px-1 py-0.5 rounded shrink-0 border-0 bg-transparent cursor-pointer"
                  >
                    Bỏ lọc ✕
                  </button>
                </div>
              )}

              {/* BOTTOM SECTION: Kế thừa MobileInvoiceList */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <MobileInvoiceList
                  invoices={filteredInvoices}
                  onSelectInvoice={(inv) => setSelectedDetailInvoice(inv)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Selected Invoice Detail Modal (khi người dùng bấm vào 1 hóa đơn cụ thể) */}
      <MobileInvoiceDetailModal
        invoice={selectedDetailInvoice}
        onClose={() => setSelectedDetailInvoice(null)}
      />
    </>
  );
};

export default DailyInvoicesModal;
