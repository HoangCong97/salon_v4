import React from "react";
import { 
  Users, Trash2, Plus, Tag, CreditCard, QrCode, FileText, X, Printer, Loader2 
} from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";
import { ExcelInput, ExcelSelect } from "../../../components/desktop/TableComponents";
import { getEmployeeColor } from "./POSLeftPanel";
import { POSCreateCustomerModal } from "./POSReceiptModal";

interface CartItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  itemType: "SERVICE" | "PRODUCT" | "PACKAGE";
  staffId: string;
  discount?: number;
}

interface Invoice {
  id: string;
  name: string;
  cart: CartItem[];
  selectedCustomerId: string;
  voucherCode: string;
  discountPercent: number;
  paymentMethod: string;
}

interface StaffMember {
  id: string;
  name: string;
  role?: { name: string } | null;
}

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration?: number | null;
  category?: { name: string } | null;
  discountPrice?: number | null;
  additionalPrices?: number[] | null;
}

interface POSRightPanelProps {
  invoices: Invoice[];
  activeInvoiceId: string;
  setActiveInvoiceId: (id: string) => void;
  addNewInvoice: () => void;
  deleteInvoice: (id: string, event: React.MouseEvent) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (custId: string) => void;
  cart: CartItem[];
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  applyVoucher: () => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
  checkingOut: boolean;
  handleCheckout: () => Promise<void>;
  activeStaff: StaffMember[];
  activeServices: ServiceItem[];
  updateCartItemStylist: (cartId: string, newStylistId: string) => void;
  updateCartItemPrice: (cartId: string, newPriceVal: string | number) => void;
  updateCartItemDiscount: (cartId: string, newDiscountVal: string | number) => void;
  adjustQuantity: (cartId: string, amount: number) => void;
  customers: Array<{ id: string; name: string; phone: string; rank: string }>;
  onCreateCustomer: (name: string, phone: string) => void;
}

const formatNumber = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === "") return "";
  const cleaned = String(val).replace(/\D/g, "");
  if (!cleaned) return "";
  return new Intl.NumberFormat("vi-VN").format(parseInt(cleaned, 10));
};

export const POSRightPanel: React.FC<POSRightPanelProps> = ({
  invoices,
  activeInvoiceId,
  setActiveInvoiceId,
  addNewInvoice,
  deleteInvoice,
  selectedCustomerId,
  setSelectedCustomerId,
  cart,
  voucherCode,
  setVoucherCode,
  applyVoucher,
  paymentMethod,
  setPaymentMethod,
  subtotal,
  discountPercent,
  discountAmount,
  finalAmount,
  checkingOut,
  handleCheckout,
  activeStaff,
  activeServices,
  updateCartItemStylist,
  updateCartItemPrice,
  updateCartItemDiscount,
  adjustQuantity,
  customers,
  onCreateCustomer,
}) => {
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const [customerQuery, setCustomerQuery] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [prefillName, setPrefillName] = React.useState("");
  const [prefillPhone, setPrefillPhone] = React.useState("");

  React.useEffect(() => {
    if (selectedCustomer && selectedCustomerId !== "c1") {
      setCustomerQuery(selectedCustomer.name);
    } else {
      setCustomerQuery("");
    }
  }, [selectedCustomerId, selectedCustomer]);

  const handleInputChange = (val: string) => {
    setCustomerQuery(val);
    setShowSuggestions(true);
    if (!val.trim()) {
      setSelectedCustomerId("c1");
    }
  };

  const filteredCustomers = React.useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return [];
    return customers.filter(c => 
      (c.name.toLowerCase().includes(q) || c.phone.includes(q)) && c.id !== "c1"
    );
  }, [customerQuery, customers]);

  const exactMatch = customers.find(c => c.name.toLowerCase() === customerQuery.trim().toLowerCase() || c.phone === customerQuery.trim());
  const showCreateSuggestion = customerQuery.trim().length > 0 && !exactMatch;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px", position: "relative", minHeight: 0, overflow: "hidden" }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      
      {/* Invoice Tabs */}
      <div 
        className="no-scrollbar"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "6px", 
          borderBottom: "1px solid var(--border-color)", 
          height: "40px", 
          marginBottom: "12px", 
          overflowX: "auto", 
          flexShrink: 0,
          boxSizing: "border-box"
        }}
      >
        {invoices.map((inv) => {
          const isActive = inv.id === activeInvoiceId;
          return (
            <div
              key={inv.id}
              onClick={() => setActiveInvoiceId(inv.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 12px",
                height: "28px",
                boxSizing: "border-box",
                borderRadius: "var(--radius-sm)",
                border: isActive ? "2px solid var(--color-primary)" : "2px solid var(--border-color)",
                background: isActive ? "var(--color-primary-light)" : "white",
                color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                fontWeight: "600",
                fontSize: "12.5px",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                position: "relative"
              }}
            >
              <span>{inv.name} {inv.cart.length > 0 && `(${inv.cart.length})`}</span>
              {invoices.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => deleteInvoice(inv.id, e)}
                  style={{
                    background: "none",
                    border: "none",
                    color: isActive ? "var(--color-primary)" : "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={addNewInvoice}
          style={{
            padding: "4px 8px",
            height: "28px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            borderRadius: "var(--radius-sm)",
            flexShrink: 0
          }}
        >
          <Plus size={12} /> HĐ mới
        </button>
      </div>

      {/* Customer Selection */}
      <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "16px", flexShrink: 0 }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Users size={18} style={{ color: "var(--color-primary)" }} /> KHÁCH HÀNG
        </h3>
        
        {showSuggestions && (
          <div 
            onClick={() => setShowSuggestions(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
          />
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px", position: "relative", zIndex: 95 }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="form-input"
              value={customerQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Nhập khách hàng..."
              style={{ width: "100%", height: "36px" }}
            />
            {showSuggestions && (customerQuery.trim().length > 0) && (
              <div 
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  background: "white",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow-md)",
                  zIndex: 100,
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginTop: "4px"
                }}
              >
                {filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setCustomerQuery(c.name);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "12.5px",
                      borderBottom: "1px solid #f1f5f9",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <strong>{c.name}</strong> {c.phone ? `(${c.phone})` : ""} - <span style={{ color: "var(--color-primary)" }}>{c.rank}</span>
                  </div>
                ))}
                
                {showCreateSuggestion && (
                  <div
                    onClick={() => {
                      const q = customerQuery.trim();
                      const isPhone = /^[0-9+\s]+$/.test(q);
                      if (isPhone) {
                        setPrefillPhone(q);
                        setPrefillName("");
                      } else {
                        setPrefillName(q);
                        setPrefillPhone("");
                      }
                      setShowCreateModal(true);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "12.5px",
                      background: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      fontWeight: "600",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#e0f2fe"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-primary-light)"}
                  >
                    ➕ Tạo khách hàng mới: "{customerQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-primary-light)",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--color-primary)",
            border: "1px solid var(--border-focus)",
            textAlign: "center"
          }}>
            Hạng: {selectedCustomer?.rank || "Khách mới"}
          </div>
        </div>
      </div>

      {/* Cart items area */}
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px" }}>
        MẶT HÀNG THANH TOÁN ({cart.length})
      </h3>

      <div style={{ flex: "1 1 0px", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px", minHeight: "150px", overflow: "hidden" }}>
        {cart.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", opacity: 0.7, padding: "40px 0" }}>
            <FileText size={36} />
            <p style={{ marginTop: "8px", fontSize: "13px" }}>Giỏ hàng đang trống.</p>
          </div>
        ) : (
          <div className="data-table-container" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "white", overflowY: "auto", flex: "1 1 0px" }}>
            <table className="data-table" style={{ width: "100%", fontSize: "12.5px", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 10px", fontSize: "12px", width: "140px", position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, borderBottom: "1px solid var(--border-color)" }}>Mặt hàng</th>
                  <th style={{ padding: "8px 10px", fontSize: "12px", width: "130px", position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, borderBottom: "1px solid var(--border-color)" }}>Thợ</th>
                  <th style={{ padding: "8px 10px", fontSize: "12px", textAlign: "center", width: "125px", position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, borderBottom: "1px solid var(--border-color)" }}>Đơn giá</th>
                  <th style={{ padding: "8px 10px", fontSize: "12px", textAlign: "center", width: "110px", position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, borderBottom: "1px solid var(--border-color)", color: "var(--color-danger)" }}>Giảm giá</th>
                  <th style={{ padding: "8px 10px", fontSize: "12px", textAlign: "right", width: "110px", position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, borderBottom: "1px solid var(--border-color)" }}>T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((cItem) => {
                  const empColor = getEmployeeColor(cItem.staffId);
                  
                  // Get available prices for this service
                  const serviceObj = activeServices.find(s => s.id === cItem.itemId);
                  const availablePrices: number[] = [];
                  if (serviceObj) {
                    if (serviceObj.price !== undefined && serviceObj.price !== null) {
                      availablePrices.push(serviceObj.price);
                    }
                    if (serviceObj.discountPrice !== undefined && serviceObj.discountPrice !== null && serviceObj.discountPrice !== serviceObj.price) {
                      availablePrices.push(serviceObj.discountPrice);
                    }
                    if (serviceObj.additionalPrices && Array.isArray(serviceObj.additionalPrices)) {
                      serviceObj.additionalPrices.forEach(p => {
                        const numP = Number(p);
                        if (!isNaN(numP) && !availablePrices.includes(numP)) {
                          availablePrices.push(numP);
                        }
                      });
                    }
                  }

                  const hasMultiplePrices = cItem.itemType === "SERVICE" && availablePrices.length > 1;

                  return (
                    <tr key={cItem.id}>
                      {/* Item name - exactly 1 line */}
                      <td style={{ padding: "8px 10px", verticalAlign: "middle", width: "140px" }}>
                        <div 
                          title={cItem.name} 
                          style={{ 
                            fontWeight: "700", 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis",
                            width: "130px"
                          }}
                        >
                          {cItem.name}
                        </div>
                      </td>

                      {/* Stylist Selector */}
                      <td style={{ padding: "4px 6px", verticalAlign: "middle", width: "130px" }}>
                        <ExcelSelect
                          value={cItem.staffId}
                          onChange={(val) => updateCartItemStylist(cItem.id, val)}
                          options={activeStaff.map(st => ({ value: st.id, label: st.name.split("(")[0] }))}
                          colorStyle={{
                            background: empColor.bg,
                            color: empColor.text,
                            border: `1.5px solid ${empColor.border}`,
                            height: "26px",
                            padding: "0 4px",
                            fontSize: "11.5px",
                            fontWeight: "600",
                            width: "100%"
                          }}
                        />
                      </td>

                      {/* Editable unit price & preset price dropdown merged */}
                      <td style={{ padding: "4px 6px", verticalAlign: "middle", textAlign: "center", width: "125px" }}>
                        {hasMultiplePrices ? (
                          <ExcelSelect
                            value={String(cItem.price)}
                            onChange={(val) => updateCartItemPrice(cItem.id, Number(val))}
                            options={availablePrices.map((p) => ({
                              value: String(p),
                              label: `${formatNumber(p)}đ`
                            }))}
                            placeholder="-- Chọn giá --"
                            colorStyle={{
                              height: "26px",
                              padding: "0 10px",
                              fontSize: "12.5px",
                              fontWeight: "700",
                              width: "100px",
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-sm)",
                              background: "transparent",
                              color: "var(--text-primary)",
                              margin: "0 auto"
                            }}
                          />
                        ) : (
                          <div 
                            style={{ 
                              width: "100px", 
                              height: "26px", 
                              border: "1px solid var(--border-color)", 
                              borderRadius: "var(--radius-sm)", 
                              background: "white",
                              position: "relative",
                              margin: "0 auto"
                            }}
                          >
                            <ExcelInput
                              value={formatNumber(cItem.price)}
                              onChange={(val) => updateCartItemPrice(cItem.id, val)}
                              textAlign="center"
                              fontWeight="700"
                              unit="đ"
                              showUnit={false}
                              type="text"
                            />
                          </div>
                        )}
                      </td>

                      {/* Item Discount Input */}
                      <td style={{ padding: "4px 6px", verticalAlign: "middle", textAlign: "center", width: "110px" }}>
                        <div 
                          style={{ 
                            width: "90px", 
                            height: "26px", 
                            border: "1px solid var(--border-color)", 
                            borderRadius: "var(--radius-sm)", 
                            background: "white",
                            position: "relative",
                            margin: "0 auto"
                          }}
                        >
                          <ExcelInput
                            value={formatNumber(cItem.discount)}
                            onChange={(val) => updateCartItemDiscount(cItem.id, val)}
                            textAlign="center"
                            fontWeight="700"
                            unit="đ"
                            showUnit={false}
                            type="text"
                            textColor="var(--color-danger)"
                          />
                        </div>
                      </td>

                      {/* Price & Trash Delete on same row */}
                      <td style={{ padding: "8px 10px", verticalAlign: "middle", textAlign: "right", width: "110px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <span style={{ fontWeight: "700", whiteSpace: "nowrap" }}>
                            {formatCurrencyVND((cItem.price - (cItem.discount || 0)) * cItem.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustQuantity(cItem.id, -cItem.quantity)}
                            style={{ 
                              background: "none", 
                              border: "none", 
                              color: "var(--color-danger)", 
                              cursor: "pointer",
                              padding: 0,
                              display: "inline-flex",
                              alignItems: "center"
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Method & QR Code Display */}
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "16px", flexShrink: 0 }}>
        
        {/* Voucher input */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <div style={{ position: "relative", flexGrow: 1 }}>
            <Tag size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-input"
              placeholder="Mã giảm giá (ví dụ VOUCHER10%)..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              style={{ paddingLeft: "30px", height: "34px", fontSize: "12.5px" }}
            />
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={applyVoucher}
            style={{ padding: "0 12px", height: "34px", fontSize: "12.5px" }}
          >
            Áp dụng
          </button>
        </div>

        {/* Payment Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Phương thức thanh toán:</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12.5px",
                fontWeight: "600",
                border: paymentMethod === "CASH" ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                background: paymentMethod === "CASH" ? "var(--color-primary-light)" : "white",
                color: paymentMethod === "CASH" ? "var(--color-primary)" : "var(--text-primary)",
                cursor: "pointer"
              }}
            >
              <CreditCard size={14} /> Tiền mặt
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("BANK_TRANSFER")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12.5px",
                fontWeight: "600",
                border: paymentMethod === "BANK_TRANSFER" ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                background: paymentMethod === "BANK_TRANSFER" ? "var(--color-primary-light)" : "white",
                color: paymentMethod === "BANK_TRANSFER" ? "var(--color-primary)" : "var(--text-primary)",
                cursor: "pointer"
              }}
            >
              <QrCode size={14} /> Chuyển khoản (QR)
            </button>
          </div>
        </div>

        {/* Simulated Bank QR Code box */}
        {paymentMethod === "BANK_TRANSFER" && finalAmount > 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            background: "#faf5ff",
            padding: "12px",
            border: "1px solid #ebd5fc",
            borderRadius: "var(--radius-sm)",
            marginBottom: "12px",
            textAlign: "center"
          }}>
            <QrCode size={100} style={{ color: "#7e22ce" }} />
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", display: "block", color: "#6b21a8" }}>QUÉT QR ĐỐI SOÁT VNPAY/PayOS</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Số tiền: <strong style={{ color: "var(--color-primary)" }}>{formatCurrencyVND(finalAmount)}</strong></span>
            </div>
          </div>
        )}

        {/* Final calculations section */}
        <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Tạm tính:</span>
            <span style={{ fontWeight: "600" }}>{formatCurrencyVND(subtotal)}</span>
          </div>
          {discountPercent > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
              <span style={{ color: "var(--color-danger)" }}>Giảm giá ({discountPercent}%):</span>
              <span style={{ fontWeight: "600", color: "var(--color-danger)" }}>-{formatCurrencyVND(discountAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontWeight: "700", fontSize: "14px" }}>Thành tiền:</span>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{formatCurrencyVND(finalAmount)}</span>
          </div>
        </div>

        {/* Print & checkout button */}
        <button 
          className="btn btn-primary" 
          style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "700" }} 
          disabled={cart.length === 0 || checkingOut}
          onClick={handleCheckout}
        >
          {checkingOut ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Đang xử lý...
            </>
          ) : (
            <>
              <Printer size={16} /> IN HOÁ ĐƠN & THANH TOÁN
            </>
          )}
        </button>

      </div>

      <POSCreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={onCreateCustomer}
        prefillName={prefillName}
        prefillPhone={prefillPhone}
      />

    </div>
  );
};
