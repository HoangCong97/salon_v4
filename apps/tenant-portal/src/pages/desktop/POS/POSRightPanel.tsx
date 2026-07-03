import React from "react";
import {
  Users, Trash2, Plus, Tag, CreditCard, QrCode, FileText, X, Printer, Loader2
} from "lucide-react";

import { ExcelInput, ExcelSelect, ExcelRow } from "../../../components/desktop/TableComponents";

import { formatCurrencyVND } from "@salon/shared-utils";

import { getEmployeeColor } from "./POSLeftPanel";
import { POSCreateCustomerModal } from "./POSReceiptModal";

import styles from "./POS.module.css";

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
  isEditing?: boolean;
  editingInvoiceId?: string;
  originalCreatedAt?: string;
  createdAt?: string;
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
  canEditInvoice: boolean;
  updateInvoiceCreatedAt: (dateStr: string) => void;
}

const formatNumber = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === "") return "";
  const cleaned = String(val).replace(/\D/g, "");
  if (!cleaned) return "";
  return new Intl.NumberFormat("vi-VN").format(parseInt(cleaned, 10));
};

const formatDateTimeDMYHM = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const parseDateTimeDMYHM = (str: string): Date | null => {
  const match = str.trim().match(/^(\d{2})[-/.](\d{2})[-/.](\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  const hours = parseInt(match[4], 10);
  const minutes = parseInt(match[5], 10);

  const d = new Date(year, month, day, hours, minutes);
  if (isNaN(d.getTime())) return null;
  return d;
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
  canEditInvoice,
  updateInvoiceCreatedAt,
}) => {
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const activeInvoice = invoices.find(inv => inv.id === activeInvoiceId);
  const isEditing = activeInvoice?.isEditing;

  const [customerQuery, setCustomerQuery] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [prefillName, setPrefillName] = React.useState("");
  const [prefillPhone, setPrefillPhone] = React.useState("");
  const [showQRPopover, setShowQRPopover] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(() => new Date().toISOString());
  const [dateTimeStr, setDateTimeStr] = React.useState("");
  const isFocusedRef = React.useRef(false);
  const tabsScrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to the rightmost tab when a new tab is created
  React.useEffect(() => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollTo({
        left: tabsScrollRef.current.scrollWidth,
        behavior: "smooth"
      });
    }
  }, [invoices.length]);

  // Live ticking clock for new/unmodified invoices
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 10000); // Update every 10 seconds
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (isFocusedRef.current) return;
    const activeDate = activeInvoice?.createdAt || activeInvoice?.originalCreatedAt || currentTime;
    setDateTimeStr(formatDateTimeDMYHM(activeDate));
  }, [activeInvoiceId, activeInvoice?.createdAt, activeInvoice?.originalCreatedAt, currentTime]);

  const handleDateTimeStrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateTimeStr(val);

    const parsedDate = parseDateTimeDMYHM(val);
    if (parsedDate) {
      updateInvoiceCreatedAt(parsedDate.toISOString());
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const parsedDate = parseDateTimeDMYHM(dateTimeStr);
    if (parsedDate) {
      updateInvoiceCreatedAt(parsedDate.toISOString());
    } else {
      const activeDate = activeInvoice?.createdAt || activeInvoice?.originalCreatedAt || currentTime;
      setDateTimeStr(formatDateTimeDMYHM(activeDate));
    }
  };

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
    <div className={`card ${styles.container}`}>
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
        ref={tabsScrollRef}
        className={`${styles.thinScrollbar} ${styles.tabsScroll}`}
        onWheel={(e) => {
          const container = e.currentTarget;
          if (e.deltaY !== 0) {
            container.scrollLeft += e.deltaY;
          }
        }}
      >
        {invoices.map((inv) => {
          const isActive = inv.id === activeInvoiceId;
          return (
            <div
              key={inv.id}
              onClick={() => setActiveInvoiceId(inv.id)}
              className={`${styles.tabItem} ${isActive ? styles.tabActive : styles.tabInactive}`}
            >
              <span>{inv.name} {inv.cart.length > 0 && `(${inv.cart.length})`}</span>
              {invoices.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => deleteInvoice(inv.id, e)}
                  className={`${styles.tabDeleteBtn} ${isActive ? styles.tabDeleteBtnActive : styles.tabDeleteBtnInactive}`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          className={`btn btn-secondary ${styles.addTabBtn}`}
          onClick={addNewInvoice}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Customer Selection */}
      <div className={styles.customerSection}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 className={styles.customerHeader} style={{ margin: 0 }}>
            <Users size={18} className={styles.customerIcon} /> KHÁCH HÀNG
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, minWidth: "60px" }}>Thời gian:</span>
            <input
              type="text"
              value={dateTimeStr}
              onChange={handleDateTimeStrChange}
              onBlur={handleBlur}
              onFocus={() => { isFocusedRef.current = true; }}
              placeholder="DD-MM-YYYY HH:MM"
              disabled={!canEditInvoice}
              className="form-input"
              style={{
                fontSize: "12.5px",
                padding: "4px 8px",
                height: "28px",
                width: "130px",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                opacity: canEditInvoice ? 1 : 0.6,
                cursor: canEditInvoice ? "text" : "not-allowed",
                background: canEditInvoice ? "white" : "#f1f5f9",
                textAlign: "center"
              }}
            />
          </div>
        </div>

        {showSuggestions && (
          <div
            onClick={() => setShowSuggestions(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
          />
        )}
        <div className={styles.customerGrid}>
          <div className={styles.customerInputWrapper}>
            <input
              type="text"
              className={`form-input ${styles.customerInput}`}
              value={customerQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Nhập khách hàng..."
            />
            {showSuggestions && (customerQuery.trim().length > 0) && (
              <div className={styles.suggestionsBox}>
                {filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setCustomerQuery(c.name);
                      setShowSuggestions(false);
                    }}
                    className={styles.suggestionItem}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <strong>{c.name}</strong> {c.phone ? `(${c.phone})` : ""} - <span className={styles.suggestionRank}>{c.rank}</span>
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
                    className={styles.newCustomerBtn}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#e0f2fe"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-primary-light)"}
                  >
                    ➕ Tạo khách hàng mới: "{customerQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.customerRankBadge}>
            Hạng: {selectedCustomer?.rank || "Khách mới"}
          </div>
        </div>
      </div>

      {/* Cart items area */}
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px" }}>
        MẶT HÀNG THANH TOÁN ({cart.length})
      </h3>

      <div className={styles.cartSection}>
        {cart.length === 0 ? (
          <div className={styles.emptyCart}>
            <FileText size={36} />
            <p className={styles.emptyCartText}>Giỏ hàng đang trống.</p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} style={{ width: "140px" }}>Mặt hàng</th>
                  <th className={styles.th} style={{ width: "130px" }}>Thợ</th>
                  <th className={styles.th} style={{ textAlign: "center", width: "125px" }}>Đơn giá</th>
                  <th className={`${styles.th} ${styles.thDiscount}`} style={{ textAlign: "center", width: "110px" }}>Giảm giá</th>
                  <th className={styles.th} style={{ textAlign: "right", width: "110px" }}>T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((cItem) => {
                  const empColor = getEmployeeColor(cItem.staffId, activeStaff);

                  // Get available prices for this service
                  const serviceObj = activeServices.find(s => s.id === cItem.itemId);
                  const availablePrices: number[] = [];
                  if (serviceObj) {
                    if (serviceObj.price !== undefined && serviceObj.price !== null) {
                      availablePrices.push(serviceObj.price);
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
                    <ExcelRow
                      key={cItem.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        adjustQuantity(cItem.id, -cItem.quantity);
                      }}
                      className={styles.tr}
                    >
                      {/* Item name - exactly 1 line */}
                      <td className={`${styles.td} ${styles.tdName}`}>
                        <div title={cItem.name} className={styles.nameWrapper}>
                          {cItem.name}
                        </div>
                      </td>

                      {/* Stylist Selector */}
                      <td className={styles.tdStaff}>
                        <ExcelSelect
                          value={cItem.staffId}
                          onChange={(val) => updateCartItemStylist(cItem.id, val)}
                          options={activeStaff.map(st => ({ value: st.id, label: st.name.split("(")[0] }))}
                          colorStyle={{
                            background: "white",
                            color: empColor.color,
                            border: `1px solid ${empColor.color}`,
                            height: "26px",
                            fontSize: "11.5px",
                            fontWeight: "500",
                            width: "100%"
                          }}
                        />
                      </td>

                      {/* Editable unit price & preset price dropdown merged */}
                      <td className={styles.tdPrice}>
                        {hasMultiplePrices ? (
                          <ExcelSelect
                            value={formatNumber(cItem.price)}
                            onChange={(val) => updateCartItemPrice(cItem.id, val)}
                            options={availablePrices.map((p) => ({
                              value: String(p),
                              label: `${formatNumber(p)}đ`
                            }))}
                            placeholder="-- Chọn giá --"
                            allowCustom={true}
                            unit="đ"
                            colorStyle={{
                              height: "26px",
                              fontSize: "12.5px",
                              fontWeight: "500",
                              width: "100px",
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-sm)",
                              background: "white",
                              color: "var(--text-primary)",
                              margin: "0 auto"
                            }}
                          />
                        ) : (
                          <div className={styles.priceWrapper}>
                            <ExcelInput
                              value={formatNumber(cItem.price)}
                              onChange={(val) => updateCartItemPrice(cItem.id, val)}
                              textAlign="center"
                              fontWeight="500"
                              unit="đ"
                              showUnit={false}
                              type="text"
                            />
                          </div>
                        )}
                      </td>

                      {/* Item Discount Input */}
                      <td className={styles.tdDiscount}>
                        <div className={styles.discountWrapper}>
                          <ExcelInput
                            value={formatNumber(cItem.discount)}
                            onChange={(val) => updateCartItemDiscount(cItem.id, val)}
                            textAlign="center"
                            fontWeight="500"
                            unit="đ"
                            showUnit={false}
                            type="text"
                            textColor="var(--color-danger)"
                          />
                        </div>
                      </td>

                      {/* Price & Trash Delete on same row */}
                      <td className={styles.tdTotal}>
                        <div className={styles.totalContainer}>
                          <span className={styles.totalPriceText}>
                            {formatCurrencyVND((cItem.price - (cItem.discount || 0)) * cItem.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustQuantity(cItem.id, -cItem.quantity)}
                            className={styles.deleteItemBtn}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </ExcelRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Method & QR Code Display */}
      <div className={styles.checkoutSection}>

        {/* Voucher input */}
        <div className={styles.voucherWrapper}>
          <div className={styles.voucherInputWrapper}>
            <Tag size={14} className={styles.voucherIcon} />
            <input
              type="text"
              className={`form-input ${styles.voucherInput}`}
              placeholder="Mã giảm giá (ví dụ VOUCHER10%)..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`btn btn-secondary ${styles.voucherApplyBtn}`}
            onClick={applyVoucher}
          >
            Áp dụng
          </button>
        </div>

        {/* Payment Selector */}
        <div className={styles.paymentWrapper}>
          <span className={styles.paymentTitle}>Phương thức thanh toán:</span>
          <div className={styles.paymentGrid}>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("CASH");
                setShowQRPopover(false);
              }}
              className={`btn ${styles.paymentBtn} ${paymentMethod === "CASH" ? styles.paymentBtnActive : styles.paymentBtnInactive}`}
            >
              <CreditCard size={14} /> Tiền mặt
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("BANK_TRANSFER");
                setShowQRPopover(true);
              }}
              className={`btn ${styles.paymentBtn} ${paymentMethod === "BANK_TRANSFER" ? styles.paymentBtnActive : styles.paymentBtnInactive}`}
            >
              <QrCode size={14} /> Chuyển khoản (QR)
            </button>
          </div>
        </div>

        {/* Final calculations section */}
        <div className={styles.calcSection}>
          <div className={styles.calcRow}>
            <span className={styles.calcLabel}>Tạm tính:</span>
            <span className={styles.calcValue}>{formatCurrencyVND(subtotal)}</span>
          </div>
          {discountPercent > 0 && (
            <div className={styles.calcRow}>
              <span className={styles.discountLabel}>Giảm giá ({discountPercent}%):</span>
              <span className={styles.discountValue}>-{formatCurrencyVND(discountAmount)}</span>
            </div>
          )}
          <div className={styles.finalRow}>
            <span className={styles.finalLabel}>Thành tiền:</span>
            <span className={styles.finalValue}>{formatCurrencyVND(finalAmount)}</span>
          </div>
        </div>

        {/* Print & checkout button */}
        <button
          className={`btn btn-primary ${styles.checkoutBtn}`}
          disabled={cart.length === 0 || checkingOut}
          onClick={handleCheckout}
        >
          {checkingOut ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Đang xử lý...
            </>
          ) : (
            <>
              <Printer size={16} /> {isEditing ? "CẬP NHẬT HOÁ ĐƠN" : "IN HOÁ ĐƠN & THANH TOÁN"}
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

      {/* Floating QR Card Popover */}
      {paymentMethod === "BANK_TRANSFER" && showQRPopover && finalAmount > 0 && (
        <div className={styles.qrCardPopover}>
          {/* Close button */}
          <button
            onClick={() => setShowQRPopover(false)}
            className={styles.qrCloseBtn}
          >
            <X size={16} />
          </button>

          <h4 className={styles.qrHeader}>MÃ QR THANH TOÁN</h4>

          <div className={styles.qrCodeBorder}>
            <QrCode size={250} style={{ color: "#7e22ce" }} />
          </div>

          <div className={styles.qrFooterDesc}>
            Quét mã QR chuyển khoản đối soát VNPAY/PayOS
          </div>

          <div className={styles.qrFooterAmount}>
            Số tiền: <strong style={{ color: "var(--color-primary)" }}>{formatCurrencyVND(finalAmount)}</strong>
          </div>

          {/* Popover Arrow pointing to Chuyển khoản button */}
          <div className={styles.qrArrow} />
        </div>
      )}

    </div>
  );
};
