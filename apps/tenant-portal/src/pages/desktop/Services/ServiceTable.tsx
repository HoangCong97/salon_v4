import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { ExcelInput, ExcelSelect, ExcelChipsInput } from "../../../components/desktop/TableComponents";
import { Service, ServiceCategory } from "./types";

interface ServiceTableProps {
  filteredServices: Service[];
  categories: ServiceCategory[];
  inlineEdits: Record<string, Partial<Service>>;
  handleInlineChange: (serviceId: string, field: keyof Service, value: any) => void;
  handlePriceChange: (serviceId: string, field: "price" | "discountPrice", valStr: string) => void;
  handleAutoSave: (serviceId: string, updatedFields: Partial<Service>) => Promise<void>;
  handleCommissionAutoSave: (serviceId: string, commissionVal: number) => Promise<void>;
  handleOpenEditModal: (service: Service) => void;
  handleDelete: (id: string) => Promise<void>;
  getInlineValue: (service: Service, field: keyof Service) => any;
  formatNumber: (val: number | string | undefined | null) => string;
  getColorStyle: (colorName: string) => any;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  filteredServices,
  categories,
  inlineEdits,
  handleInlineChange,
  handlePriceChange,
  handleAutoSave,
  handleCommissionAutoSave,
  handleOpenEditModal,
  handleDelete,
  getInlineValue,
  formatNumber,
  getColorStyle,
}) => {
  const handleDiscountInputChange = (service: Service, valStr: string) => {
    const P = Number(getInlineValue(service, "price") || 0);
    handleInlineChange(service.id, "discountInput" as keyof Service, valStr);

    if (valStr.trim() === "") {
      handleInlineChange(service.id, "discountPrice", null);
      return;
    }

    if (valStr.includes("%")) {
      const pct = parseFloat(valStr);
      if (!isNaN(pct)) {
        const discountAmt = P * (pct / 100);
        const D = Math.max(0, P - discountAmt);
        handleInlineChange(service.id, "discountPrice", Math.round(D));
      }
    } else {
      const cleaned = valStr.replace(/\D/g, "");
      const amt = parseInt(cleaned, 10);
      if (!isNaN(amt)) {
        const D = Math.max(0, P - amt);
        handleInlineChange(service.id, "discountPrice", Math.round(D));
      }
    }
  };

  const handleDiscountInputBlur = async (service: Service) => {
    const finalDiscountPrice = getInlineValue(service, "discountPrice");
    await handleAutoSave(service.id, { discountPrice: finalDiscountPrice });
    
    // Clear temporary inputs
    handleInlineChange(service.id, "discountInput" as keyof Service, undefined);
    handleInlineChange(service.id, "promoInput" as keyof Service, undefined);
  };

  const handlePromoInputChange = (service: Service, valStr: string) => {
    const P = Number(getInlineValue(service, "price") || 0);
    handleInlineChange(service.id, "promoInput" as keyof Service, valStr);

    if (valStr.trim() === "") {
      handleInlineChange(service.id, "discountPrice", null);
      return;
    }

    if (valStr.includes("%")) {
      const pct = parseFloat(valStr);
      if (!isNaN(pct)) {
        const D = Math.min(P, P * (pct / 100));
        handleInlineChange(service.id, "discountPrice", Math.round(D));
      }
    } else {
      const cleaned = valStr.replace(/\D/g, "");
      const amt = parseInt(cleaned, 10);
      if (!isNaN(amt)) {
        const D = Math.min(P, Math.max(0, amt));
        handleInlineChange(service.id, "discountPrice", Math.round(D));
      }
    }
  };

  const handlePromoInputBlur = async (service: Service) => {
    const finalDiscountPrice = getInlineValue(service, "discountPrice");
    await handleAutoSave(service.id, { discountPrice: finalDiscountPrice });

    // Clear temporary inputs
    handleInlineChange(service.id, "discountInput" as keyof Service, undefined);
    handleInlineChange(service.id, "promoInput" as keyof Service, undefined);
  };

  return (
    <div className="data-table-container" style={{ overflow: "visible" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ padding: "6px 10px", fontSize: "13px" }}>Tên dịch vụ</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "180px" }}>Phân loại</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "100px", textAlign: "center" }}>Thời lượng</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "140px", textAlign: "center" }}>Giá bán</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "140px", textAlign: "center" }}>Giá bán khác</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "140px", textAlign: "center" }}>Giảm giá</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "140px", textAlign: "center" }}>Giá KM</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "100px", textAlign: "center" }}>Hoa hồng (%)</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "100px", textAlign: "center" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map((service) => {
            const currentCategoryId = getInlineValue(service, "categoryId") as string || "";
            const currentCategoryObj = categories.find((c) => c.id === currentCategoryId);

            // Calculate discount values to only show if active and less than original price
            const hasInlineDiscount = inlineEdits[service.id] && inlineEdits[service.id].hasOwnProperty("discountPrice");
            const isDiscountActive = hasInlineDiscount
              ? (inlineEdits[service.id].discountPrice !== null && (inlineEdits[service.id].discountPrice ?? 0) < (inlineEdits[service.id].price ?? service.price))
              : (service.discountAmount !== undefined && service.discountAmount !== null && Number(service.discountAmount) > 0);
            const displayDiscountVal = isDiscountActive
              ? (hasInlineDiscount ? (inlineEdits[service.id].discountPrice ?? null) : (service.discountPrice ?? null))
              : null;

            return (
              <tr key={service.id}>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelInput
                    value={getInlineValue(service, "name") as string}
                    onChange={(val) => handleInlineChange(service.id, "name", val)}
                    onBlur={() => handleAutoSave(service.id, { name: getInlineValue(service, "name") as string })}
                    fontWeight="600"
                  />
                </td>
                <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px", boxSizing: "border-box" }}>
                  <ExcelSelect
                    value={currentCategoryId}
                    onChange={(newCatId) => {
                      handleInlineChange(service.id, "categoryId", newCatId);
                      handleAutoSave(service.id, { categoryId: newCatId });
                    }}
                    options={categories.map((cat) => ({ value: cat.id, label: cat.name, colorStyle: getColorStyle(cat.color || "") }))}
                    colorStyle={getColorStyle(currentCategoryObj?.color || "")}
                    placeholder="-- Chưa phân loại --"
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelInput
                    type="number"
                    value={getInlineValue(service, "duration") as number || 0}
                    onChange={(val) => handleInlineChange(service.id, "duration", parseInt(val) || 0)}
                    onBlur={() => handleAutoSave(service.id, { duration: getInlineValue(service, "duration") as number })}
                    textAlign="center"
                    unit="phút"
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelInput
                    value={formatNumber(getInlineValue(service, "price") as number | string)}
                    onChange={(val) => handlePriceChange(service.id, "price", val)}
                    onBlur={() => handleAutoSave(service.id, { price: getInlineValue(service, "price") as number })}
                    textAlign="center"
                    fontWeight="500"
                    unit="đ"
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelChipsInput
                    values={getInlineValue(service, "additionalPrices") as number[] || []}
                    onChange={(vals) => handleInlineChange(service.id, "additionalPrices", vals)}
                    onBlur={() => handleAutoSave(service.id, { additionalPrices: getInlineValue(service, "additionalPrices") as number[] || [] })}
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelInput
                    value={
                      getInlineValue(service, "discountInput" as keyof Service) !== undefined
                        ? (getInlineValue(service, "discountInput" as keyof Service) as string)
                        : (displayDiscountVal !== null && service.price > displayDiscountVal
                            ? formatNumber(Number(service.price) - Number(displayDiscountVal))
                            : "")
                    }
                    onChange={(val) => handleDiscountInputChange(service, val)}
                    onBlur={() => handleDiscountInputBlur(service)}
                    placeholder="--"
                    textAlign="center"
                    fontWeight="600"
                    textColor="var(--color-danger)"
                    unit={
                      getInlineValue(service, "discountInput" as keyof Service)?.toString().includes("%")
                        ? "%"
                        : "đ"
                    }
                    showUnit={
                      getInlineValue(service, "discountInput" as keyof Service) !== undefined
                        ? getInlineValue(service, "discountInput" as keyof Service)?.toString() !== ""
                        : displayDiscountVal !== null && service.price > displayDiscountVal
                    }
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelInput
                    value={
                      getInlineValue(service, "promoInput" as keyof Service) !== undefined
                        ? (getInlineValue(service, "promoInput" as keyof Service) as string)
                        : (displayDiscountVal !== null ? formatNumber(displayDiscountVal) : "")
                    }
                    onChange={(val) => handlePromoInputChange(service, val)}
                    onBlur={() => handlePromoInputBlur(service)}
                    placeholder="--"
                    textAlign="center"
                    fontWeight="600"
                    textColor="var(--color-success)"
                    unit={
                      getInlineValue(service, "promoInput" as keyof Service)?.toString().includes("%")
                        ? "%"
                        : "đ"
                    }
                    showUnit={
                      getInlineValue(service, "promoInput" as keyof Service) !== undefined
                        ? getInlineValue(service, "promoInput" as keyof Service)?.toString() !== ""
                        : displayDiscountVal !== null
                    }
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  {currentCategoryObj ? (
                    <ExcelInput
                      type="number"
                      value={
                        getInlineValue(service, "commission") !== undefined
                          ? (getInlineValue(service, "commission") as number)
                          : (currentCategoryObj.defaultCommission || 0)
                      }
                      onChange={(val) => handleInlineChange(service.id, "commission", parseInt(val) || 0)}
                      onBlur={() =>
                        handleCommissionAutoSave(
                          service.id,
                          getInlineValue(service, "commission") !== undefined
                            ? (getInlineValue(service, "commission") as number)
                            : currentCategoryObj.defaultCommission
                        )
                      }
                      textAlign="center"
                      fontWeight="600"
                      textColor="var(--text-secondary)"
                      unit="%"
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "13px" }}>
                      --
                    </div>
                  )}
                </td>
                <td style={{ padding: "0 8px", verticalAlign: "middle", textAlign: "center", height: "38px" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => handleOpenEditModal(service)}
                      title="Chỉnh sửa chi tiết"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => handleDelete(service.id)}
                      title="Xóa dịch vụ"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
