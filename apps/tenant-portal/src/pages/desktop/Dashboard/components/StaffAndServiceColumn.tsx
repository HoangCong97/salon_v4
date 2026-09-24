import React, { useRef, useEffect } from "react";
import { Users, Scissors, X } from "lucide-react";
import { StaffPerformanceItem, TopServiceData } from "../types";

interface StaffAndServiceColumnProps {
  staffPerformance: StaffPerformanceItem[];
  topServices: TopServiceData[];
  selectedStaff: string;
  onSelectStaff: (staff: string) => void;
  selectedServices: string;
  onSelectServices: (services: string) => void;
}

export function StaffAndServiceColumn({
  staffPerformance = [],
  topServices = [],
  selectedStaff,
  onSelectStaff,
  selectedServices,
  onSelectServices,
}: StaffAndServiceColumnProps) {
  // Staff Selection handlers
  const anchorStaffRef = useRef<string | null>(null);

  useEffect(() => {
    if (!anchorStaffRef.current && selectedStaff) {
      const parts = selectedStaff.split(",");
      anchorStaffRef.current = parts[parts.length - 1];
    }
  }, [selectedStaff]);

  const handleStaffClick = (e: React.MouseEvent, clickedStaffId: string) => {
    const allStaff = staffPerformance.map((s) => s.staffId);
    const selectedList = selectedStaff ? selectedStaff.split(",").filter(Boolean) : [];

    let newSelected: string[] = [];

    if (e.ctrlKey || e.metaKey) {
      if (selectedList.includes(clickedStaffId)) {
        newSelected = selectedList.filter((id) => id !== clickedStaffId);
      } else {
        newSelected = [...selectedList, clickedStaffId];
      }
      anchorStaffRef.current = clickedStaffId;
    } else if (e.shiftKey && anchorStaffRef.current) {
      const anchorIndex = allStaff.indexOf(anchorStaffRef.current);
      const clickedIndex = allStaff.indexOf(clickedStaffId);

      if (anchorIndex !== -1 && clickedIndex !== -1) {
        const start = Math.min(anchorIndex, clickedIndex);
        const end = Math.max(anchorIndex, clickedIndex);
        newSelected = allStaff.slice(start, end + 1);
      } else {
        newSelected = [clickedStaffId];
        anchorStaffRef.current = clickedStaffId;
      }
    } else {
      newSelected = [clickedStaffId];
      anchorStaffRef.current = clickedStaffId;
    }

    if (
      !e.ctrlKey &&
      !e.shiftKey &&
      selectedList.length === 1 &&
      selectedList[0] === clickedStaffId
    ) {
      newSelected = [];
      anchorStaffRef.current = null;
    }

    onSelectStaff(newSelected.join(","));
  };

  // Service Selection handlers
  const anchorServiceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!anchorServiceRef.current && selectedServices) {
      const parts = selectedServices.split(",");
      anchorServiceRef.current = parts[parts.length - 1];
    }
  }, [selectedServices]);

  const handleServiceClick = (
    e: React.MouseEvent,
    clickedServiceId: string,
  ) => {
    const allServicesList = topServices.map((s) => s.id);
    const selectedList = selectedServices ? selectedServices.split(",").filter(Boolean) : [];

    let newSelected: string[] = [];

    if (e.ctrlKey || e.metaKey) {
      if (selectedList.includes(clickedServiceId)) {
        newSelected = selectedList.filter((id) => id !== clickedServiceId);
      } else {
        newSelected = [...selectedList, clickedServiceId];
      }
      anchorServiceRef.current = clickedServiceId;
    } else if (e.shiftKey && anchorServiceRef.current) {
      const anchorIndex = allServicesList.indexOf(anchorServiceRef.current);
      const clickedIndex = allServicesList.indexOf(clickedServiceId);

      if (anchorIndex !== -1 && clickedIndex !== -1) {
        const start = Math.min(anchorIndex, clickedIndex);
        const end = Math.max(anchorIndex, clickedIndex);
        newSelected = allServicesList.slice(start, end + 1);
      } else {
        newSelected = [clickedServiceId];
        anchorServiceRef.current = clickedServiceId;
      }
    } else {
      newSelected = [clickedServiceId];
      anchorServiceRef.current = clickedServiceId;
    }

    if (
      !e.ctrlKey &&
      !e.shiftKey &&
      selectedList.length === 1 &&
      selectedList[0] === clickedServiceId
    ) {
      newSelected = [];
      anchorServiceRef.current = null;
    }

    onSelectServices(newSelected.join(","));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const selectedStaffList = selectedStaff ? selectedStaff.split(",").filter(Boolean) : [];
  const selectedServicesList = selectedServices ? selectedServices.split(",").filter(Boolean) : [];

  // Staff totals (dynamically sums selected rows if filtered)
  const staffToSum = selectedStaffList.length > 0
    ? staffPerformance.filter((s) => selectedStaffList.includes(s.staffId))
    : staffPerformance;

  const staffTotalGross = staffToSum.reduce(
    (sum, s) => sum + (s.totalPrice ?? s.revenue ?? 0),
    0,
  );
  const staffTotalActual = staffToSum.reduce(
    (sum, s) => sum + (s.actualRevenue ?? s.revenue ?? 0),
    0,
  );
  const staffTotalCustomers = staffToSum.reduce((sum, s) => sum + s.customers, 0);
  const staffTotalRecords = staffToSum.reduce((sum, s) => sum + s.recordCount, 0);

  // Service totals (dynamically sums selected rows if filtered)
  const servicesToSum = selectedServicesList.length > 0
    ? topServices.filter((s) => selectedServicesList.includes(s.id))
    : topServices;

  const serviceTotalQty = servicesToSum.reduce((sum, s) => sum + s.count, 0);
  const serviceTotalRevenue = servicesToSum.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="flex flex-col gap-3.5 h-full select-none">
      {/* 1. TOP CARD: BẢNG NHÂN VIÊN - Co giãn theo số lượng nhân viên, tối đa 50% của cả panel */}
      <div className="flex-shrink-0 flex flex-col bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden max-h-[calc(50%-7px)]">
        {/* Header */}
        <div className="h-[46px] flex items-center justify-between px-3.5 border-b border-slate-200 bg-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
              <Users size={16} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0 leading-tight">
              Nhân viên
            </h3>
            <span className="text-xs font-bold text-slate-500">
              ({staffPerformance.length})
            </span>
          </div>

          {selectedStaffList.length > 0 && (
            <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 bg-blue-50 border border-blue-300 text-blue-950 rounded-full shadow-2xs transition-all">
              <span className="text-xs font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Lọc {selectedStaffList.length} NV
              </span>
              <button
                type="button"
                onClick={() => onSelectStaff("")}
                className="w-4 h-4 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-2xs"
                title="Bỏ lọc nhân viên"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Table with Sharp Cell Borders */}
        <div className="overflow-x-auto overflow-y-auto min-h-0 text-xs bg-slate-50/30">
          <table className="w-full border-collapse text-left whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-200 text-slate-900 border-b border-slate-200 text-xs font-extrabold z-10">
              <tr>
                <th className="py-2 px-2 border-r border-slate-200 font-extrabold">Tên NV</th>
                <th className="py-2 px-2 text-right border-r border-slate-200 font-extrabold">Khách</th>
                <th className="py-2 px-2 text-right border-r border-slate-200 font-extrabold">Đơn</th>
                <th className="py-2 px-2 text-right border-r border-slate-200 font-extrabold">Doanh thu</th>
                <th className="py-2 px-2 text-right font-extrabold">Thu thực tế</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-bold text-xs">
                    Chưa có số liệu nhân viên
                  </td>
                </tr>
              ) : (
                staffPerformance.map((staff) => {
                  const isRowActive = selectedStaffList.includes(staff.staffId);
                  const grossRevenue = staff.totalPrice ?? staff.revenue ?? 0;
                  const actualRevenue = staff.actualRevenue ?? staff.revenue ?? 0;

                  return (
                    <tr
                      key={staff.staffId}
                      onClick={(e) => handleStaffClick(e, staff.staffId)}
                      onMouseDown={(e) => {
                        if (e.shiftKey || e.ctrlKey || e.metaKey) e.preventDefault();
                      }}
                      className={`cursor-pointer transition-colors duration-100 border-b border-slate-200 ${
                        isRowActive
                          ? "bg-blue-100 text-blue-900 font-extrabold border-l-4 border-l-blue-600"
                          : "even:bg-slate-50/70 hover:bg-blue-50/60 text-slate-800"
                      }`}
                      title="Bấm để lọc. Giữ Ctrl hoặc Shift để chọn nhiều"
                    >
                      {/* 1. Tên NV */}
                      <td className="py-2 px-2 truncate max-w-[85px] font-bold border-r border-slate-200 text-slate-900">
                        {staff.staffName}
                      </td>

                      {/* 2. Khách */}
                      <td className="py-2 px-2 text-right text-amber-800 font-bold border-r border-slate-200">
                        {staff.customers > 0 ? staff.customers : "-"}
                      </td>

                      {/* 3. Đơn */}
                      <td className="py-2 px-2 text-right font-bold text-slate-900 border-r border-slate-200">
                        {staff.recordCount > 0 ? staff.recordCount : "-"}
                      </td>

                      {/* 4. Doanh thu (Giá DV ban đầu) */}
                      <td className="py-2 px-2 text-right text-blue-700 font-bold border-r border-slate-200">
                        {grossRevenue > 0 ? formatNumber(grossRevenue) : "-"}
                      </td>

                      {/* 5. Thu thực tế (sau giảm giá) */}
                      <td className="py-2 px-2 text-right font-black text-emerald-700">
                        {actualRevenue > 0 ? formatNumber(actualRevenue) : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {staffPerformance.length > 0 && (
              <tfoot className="sticky bottom-0 bg-slate-200 border-t border-slate-200 font-extrabold text-xs text-slate-900 z-10 shadow-2xs">
                <tr>
                  <td className="py-2 px-2 border-r border-slate-200 font-extrabold">
                    {selectedStaffList.length > 0 ? `Tổng (${selectedStaffList.length} NV)` : "Tổng"}
                  </td>
                  <td className="py-2 px-2 text-right text-amber-800 border-r border-slate-200 font-black">
                    {formatNumber(staffTotalCustomers)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 border-r border-slate-200 font-black">
                    {formatNumber(staffTotalRecords)}
                  </td>
                  <td className="py-2 px-2 text-right text-blue-700 border-r border-slate-200 font-black">
                    {formatNumber(staffTotalGross)}
                  </td>
                  <td className="py-2 px-2 text-right text-emerald-700 font-black">
                    {formatNumber(staffTotalActual)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 2. BOTTOM CARD: BẢNG DỊCH VỤ - Chiếm toàn bộ phần chiều cao còn lại của panel */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="h-[46px] flex items-center justify-between px-3.5 border-b border-slate-200 bg-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
              <Scissors size={16} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0 leading-tight">
              Dịch vụ
            </h3>
            <span className="text-xs font-bold text-slate-500">
              ({topServices.length})
            </span>
          </div>

          {selectedServicesList.length > 0 && (
            <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 bg-blue-50 border border-blue-300 text-blue-950 rounded-full shadow-2xs transition-all">
              <span className="text-xs font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Lọc {selectedServicesList.length} DV
              </span>
              <button
                type="button"
                onClick={() => onSelectServices("")}
                className="w-4 h-4 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-2xs"
                title="Bỏ lọc dịch vụ"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Table with Sharp Cell Borders */}
        <div className="flex-1 overflow-y-auto min-h-0 text-xs bg-slate-50/30">
          <table className="w-full border-collapse text-left table-fixed">
            <thead className="sticky top-0 bg-slate-200 text-slate-900 border-b border-slate-200 text-xs font-extrabold z-10">
              <tr>
                <th className="py-2 px-2.5 border-r border-slate-200 font-extrabold">Tên dịch vụ</th>
                <th className="py-2 px-2.5 text-right border-r border-slate-200 font-extrabold w-16">SL</th>
                <th className="py-2 px-2.5 text-right font-extrabold w-28">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {topServices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500 font-bold text-xs">
                    Chưa có số liệu dịch vụ
                  </td>
                </tr>
              ) : (
                topServices.map((service) => {
                  const isRowActive = selectedServicesList.includes(service.id);
                  return (
                    <tr
                      key={service.id}
                      onClick={(e) => handleServiceClick(e, service.id)}
                      onMouseDown={(e) => {
                        if (e.shiftKey || e.ctrlKey || e.metaKey) e.preventDefault();
                      }}
                      className={`cursor-pointer transition-colors duration-100 border-b border-slate-200 ${
                        isRowActive
                          ? "bg-blue-100 text-blue-900 font-extrabold border-l-4 border-l-blue-600"
                          : "even:bg-slate-50/70 hover:bg-blue-50/60 text-slate-800"
                      }`}
                      title="Bấm để lọc. Giữ Ctrl hoặc Shift để chọn nhiều"
                    >
                      <td className="py-2 px-2.5 truncate font-bold border-r border-slate-200 text-slate-900">
                        {service.name}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-amber-800 border-r border-slate-200 w-16">
                        {service.count > 0 ? service.count : "-"}
                      </td>
                      <td className="py-2 px-2.5 text-right font-black text-emerald-700 w-28">
                        {service.revenue > 0 ? formatNumber(service.revenue) : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Ô TỔNG DỊCH VỤ CỐ ĐỊNH DƯỚI CÙNG CARD */}
        {topServices.length > 0 && (
          <div className="flex-shrink-0 bg-slate-200 border-t border-slate-200 font-extrabold text-xs text-slate-900 z-10 shadow-2xs">
            <table className="w-full border-collapse text-left table-fixed">
              <tfoot>
                <tr>
                  <td className="py-2 px-2.5 border-r border-slate-200 font-extrabold">
                    {selectedServicesList.length > 0 ? `Tổng (${selectedServicesList.length} DV)` : "Tổng"}
                  </td>
                  <td className="py-2 px-2.5 text-right text-amber-800 border-r border-slate-200 font-black w-16">
                    {formatNumber(serviceTotalQty)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-emerald-700 font-black w-28">
                    {formatNumber(serviceTotalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
