import React from "react";
import { CalendarCheck2, Clock, User, Scissors } from "lucide-react";
import { RecentBookingItem } from "../types";

interface RecentBookingsProps {
  bookings: RecentBookingItem[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã hoàn thành
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Đã xác nhận
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Chờ xác nhận
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Đã hủy
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            Không đến
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
      {/* Header */}
      <div className="h-[46px] flex items-center justify-between px-4 border-b border-slate-200 bg-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
            <CalendarCheck2 size={16} />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 m-0 leading-tight">
            Hoạt động đặt lịch gần đây
          </h3>
          <span className="text-xs font-bold text-slate-500">
            ({bookings.length})
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto min-h-0 bg-slate-50/30">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Clock size={32} className="text-slate-300" />
            <span className="text-xs font-bold text-slate-500">
              Không có lịch hẹn nào được ghi nhận gần đây.
            </span>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-200 text-slate-900 border-b border-slate-200 font-extrabold sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200">Khách hàng</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Dịch vụ</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Kỹ thuật viên</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Thời gian</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-blue-50/40 transition-colors duration-100 even:bg-slate-50/50"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      <span>{b.customerName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Scissors size={13} className="text-slate-400" />
                      <span>{b.service}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700 border-r border-slate-200">
                    {b.staff}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <span>{b.time}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {getStatusBadge(b.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
