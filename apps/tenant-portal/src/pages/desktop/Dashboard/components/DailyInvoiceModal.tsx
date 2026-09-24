import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Clock, User, ShieldCheck } from "lucide-react";
import { DailyRevenueItem } from "../types";
import { formatNumber, formatVND } from "../utils";

interface DailyInvoiceModalProps {
  day: DailyRevenueItem;
  onClose: () => void;
}

export function DailyInvoiceModal({ day, onClose }: DailyInvoiceModalProps) {

  // Close on Escape & prevent body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-100">
          <div>
            <h4 className="text-base font-black text-slate-900 m-0">
              Chi tiết doanh thu ngày {day.date}
            </h4>
            <p className="text-xs text-slate-600 font-bold m-0 mt-0.5">
              Phát sinh {day.invoices.length} hóa đơn bán hàng
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-slate-50/50">
          {/* Summary 3 Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col">
              <span className="text-xs font-bold text-slate-600">Giá dịch vụ</span>
              <strong className="text-base font-black text-slate-900 mt-1">
                {formatVND(day.totalPrice)}
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 shadow-2xs flex flex-col">
              <span className="text-xs font-bold text-rose-700">Giảm giá</span>
              <strong className="text-base font-black text-rose-700 mt-1">
                {formatVND(day.discountAmount)}
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-300 shadow-2xs flex flex-col">
              <span className="text-xs font-bold text-blue-900">Thu thực tế</span>
              <strong className="text-base font-black text-blue-950 mt-1">
                {formatVND(day.finalAmount)}
              </strong>
            </div>
          </div>

          {/* Invoices List */}
          <div>
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">
              Danh sách hóa đơn ({day.invoices.length})
            </h5>

            {day.invoices.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-xl border border-dashed border-slate-200">
                Không có hóa đơn nào phát sinh trong ngày này.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {day.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors shadow-2xs flex flex-col gap-3"
                  >
                    {/* Invoice Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                          #{inv.invoiceNumber}
                        </strong>
                        <span className="flex items-center gap-1 text-xs text-slate-600 font-bold">
                          <Clock size={13} /> {inv.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-extrabold text-blue-900 bg-blue-100 border border-blue-300 rounded-full">
                          {inv.paymentStatus === "PAID" ? "Đã thu" : inv.paymentStatus}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-full">
                          {inv.paymentMethod === "CASH"
                            ? "Tiền mặt"
                            : inv.paymentMethod === "TRANSFER"
                              ? "Chuyển khoản"
                              : "Quẹt thẻ"}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Cashier */}
                    <div className="flex items-center justify-between text-xs text-slate-700 border-t border-slate-200 pt-2 font-medium">
                      <span className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-500" />
                        Khách: <strong className="text-slate-900 font-extrabold">{inv.customerName}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-slate-500" />
                        Thu ngân: <strong className="text-slate-900 font-extrabold">{inv.cashierName}</strong>
                      </span>
                    </div>

                    {/* Purchased Items Subtable */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                      <div className="grid grid-cols-12 bg-slate-200 px-3 py-1.5 font-black text-slate-900 border-b border-slate-200 text-xs">
                        <span className="col-span-6 border-r border-slate-200">Mặt hàng</span>
                        <span className="col-span-2 text-center border-r border-slate-200">SL</span>
                        <span className="col-span-2 text-right border-r border-slate-200 pr-2">Đơn giá</span>
                        <span className="col-span-2 text-right">Thành tiền</span>
                      </div>

                      {inv.items.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 px-3 py-2 border-b border-slate-200 last:border-0 items-center text-slate-800 even:bg-slate-50"
                        >
                          <div className="col-span-6 flex items-center gap-1.5 truncate border-r border-slate-200 pr-2">
                            <span className="truncate font-bold text-slate-900">{item.name}</span>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 flex-shrink-0">
                              {item.itemType === "SERVICE"
                                ? "DV"
                                : item.itemType === "PRODUCT"
                                  ? "SP"
                                  : "Gói"}
                            </span>
                          </div>
                          <span className="col-span-2 text-center font-bold border-r border-slate-200">
                            {item.quantity}
                          </span>
                          <span className="col-span-2 text-right font-medium text-slate-600 border-r border-slate-200 pr-2">
                            {formatNumber(item.price)}
                          </span>
                          <span className="col-span-2 text-right font-black text-slate-900">
                            {formatNumber(item.finalAmount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Invoice Footer Line */}
                    <div className="flex flex-col gap-1 border-t border-slate-200 pt-2 text-xs">
                      {inv.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-700 font-bold">
                          <span>Giảm giá hóa đơn:</span>
                          <span>-{formatVND(inv.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-slate-900">
                        <span>Tổng thanh toán:</span>
                        <span className="text-blue-700 text-sm">{formatVND(inv.finalAmount)}</span>
                      </div>
                      {inv.note && (
                        <div className="text-xs text-slate-500 italic mt-0.5">
                          * Ghi chú: {inv.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
