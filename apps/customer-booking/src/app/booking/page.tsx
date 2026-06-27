"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE = "http://localhost:3000/api/customer-portal";

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  duration: number;
  imageUrl?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}

interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice: number;
  duration?: number;
  services: Array<{ id: string; name: string; quantity: number }>;
}

interface Staff {
  id: string;
  name: string;
  avatar?: string;
  note?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

function BookingWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Route Params
  const queryTenantId = searchParams.get("tenantId");
  const queryBranchId = searchParams.get("branchId");

  // State Management
  const [step, setStep] = useState(1);
  const [tenantId, setTenantId] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [activeCatalogTab, setActiveCatalogTab] = useState<"services" | "packages">("services");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<{ id: string; name: string } | null>({
    id: "any",
    name: "Kỹ thuật viên ngẫu nhiên"
  });

  const [datesList, setDatesList] = useState<Array<{ label: string; weekday: string; dateStr: string }>>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  // Customer Form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successDetails, setSuccessDetails] = useState<any>(null);

  // 1. Initialize Tenant & Branch IDs
  useEffect(() => {
    // Check url param or fetch first tenant as fallback
    if (queryTenantId) {
      setTenantId(queryTenantId);
      if (queryBranchId) setBranchId(queryBranchId);
    } else {
      fetch(`${API_BASE}/tenants`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setTenantId(data[0].id);
          }
        })
        .catch((err) => console.error("Error setting default tenant:", err));
    }
  }, [queryTenantId, queryBranchId]);

  // 2. Fetch Branches when Tenant is loaded
  useEffect(() => {
    if (!tenantId) return;

    fetch(`${API_BASE}/branches?tenantId=${tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBranches(data);
          // Auto select branch if query param matches
          if (queryBranchId && data.some((b) => b.id === queryBranchId)) {
            setBranchId(queryBranchId);
          } else if (data.length > 0) {
            setBranchId(data[0].id);
          }
        }
      })
      .catch((err) => console.error("Error loading branches:", err));
  }, [tenantId, queryBranchId]);

  // 3. Fetch Services/Packages and Staff once Branch is set
  useEffect(() => {
    if (!tenantId || !branchId) return;

    setLoading(true);
    // Services
    const sPromise = fetch(`${API_BASE}/${tenantId}/services?branchId=${branchId}`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));

    // Packages
    const pPromise = fetch(`${API_BASE}/${tenantId}/packages?branchId=${branchId}`)
      .then((res) => res.json())
      .then((data) => setPackages(Array.isArray(data) ? data : []));

    // Staff
    const stPromise = fetch(`${API_BASE}/${tenantId}/branches/${branchId}/staff`)
      .then((res) => res.json())
      .then((data) => setStaffList(Array.isArray(data) ? data : []));

    Promise.all([sPromise, pPromise, stPromise])
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Error loading step data:", err);
        setLoading(false);
      });
  }, [tenantId, branchId]);

  // 4. Generate next 7 days for Booking Strip
  useEffect(() => {
    const days = [];
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    
    // Start from today (VN timezone)
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const weekday = i === 0 ? "H.Nay" : weekdays[d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, "0");
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const dateStr = `${d.getFullYear()}-${monthNum}-${dayNum}`;
      
      days.push({
        label: `${dayNum}/${monthNum}`,
        weekday,
        dateStr
      });
    }
    
    setDatesList(days);
    if (days.length > 0) {
      setSelectedDate(days[0].dateStr);
    }
  }, []);

  // 5. Fetch available time slots when date, service, or staff changes
  useEffect(() => {
    if (!tenantId || !branchId || !selectedDate || !selectedService) return;

    setTimeSlots([]);
    setSelectedTime("");
    
    const staffQuery = selectedStaff ? `&staffId=${selectedStaff.id}` : "";
    fetch(
      `${API_BASE}/${tenantId}/bookings/time-slots?branchId=${branchId}&date=${selectedDate}&serviceId=${selectedService.id}${staffQuery}`
    )
      .then((res) => res.json())
      .then((data) => setTimeSlots(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading time slots:", err));
  }, [tenantId, branchId, selectedDate, selectedService, selectedStaff]);

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setErrorMsg("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE}/${tenantId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          customerName,
          customerPhone,
          customerEmail,
          serviceId: selectedService?.id,
          staffId: selectedStaff?.id,
          date: selectedDate,
          time: selectedTime,
          note
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccessDetails(result);
        setStep(5); // Success step
      } else {
        setErrorMsg(result.message || "Không thể tạo lịch hẹn. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setErrorMsg("Lỗi mạng. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStepProgressClass = (stepNum: number) => {
    if (step === stepNum) return "step-dot active";
    if (step > stepNum) return "step-dot completed";
    return "step-dot";
  };

  // Render Step Content
  return (
    <div className="container" style={{ minHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {/* Wizard Header Progress Bar */}
      {step < 5 && (
        <div className="step-bar" style={{ marginTop: "10px" }}>
          <div className={getStepProgressClass(1)}>1</div>
          <div className={getStepProgressClass(2)}>2</div>
          <div className={getStepProgressClass(3)}>3</div>
          <div className={getStepProgressClass(4)}>4</div>
        </div>
      )}

      {/* Step 1: Chọn Chi Nhánh & Dịch Vụ */}
      {step === 1 && (
        <div className="animate-slide-up" style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--text-main)" }}>Bước 1: Chọn Chi Nhánh & Dịch Vụ</h2>

          {/* Branch select */}
          <div className="form-group">
            <label className="form-label">Chi nhánh Salon:</label>
            <select
              className="input-field"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              style={{ paddingRight: "30px", appearance: "auto" }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Catalog Tab Toggle */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", marginBottom: "16px" }}>
            <button
              onClick={() => setActiveCatalogTab("services")}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                padding: "12px",
                color: activeCatalogTab === "services" ? "var(--primary)" : "var(--text-muted)",
                fontWeight: "600",
                fontSize: "0.9rem",
                borderBottom: activeCatalogTab === "services" ? "2px solid var(--primary)" : "none",
                cursor: "pointer"
              }}
            >
              Dịch Vụ Lẻ
            </button>
            <button
              onClick={() => setActiveCatalogTab("packages")}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                padding: "12px",
                color: activeCatalogTab === "packages" ? "var(--primary)" : "var(--text-muted)",
                fontWeight: "600",
                fontSize: "0.9rem",
                borderBottom: activeCatalogTab === "packages" ? "2px solid var(--primary)" : "none",
                cursor: "pointer"
              }}
            >
              Gói Liệu Trình
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              Đang tải danh sách dịch vụ...
            </div>
          ) : activeCatalogTab === "services" ? (
            categories.map((cat) => (
              <div key={cat.id} style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "0.95rem", color: "var(--primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ display: "inline-block", width: "4px", height: "14px", backgroundColor: "var(--primary)", borderRadius: "2px" }} />
                  {cat.name}
                </h3>
                {cat.services.map((s) => (
                  <div
                    key={s.id}
                    className={`card ${selectedService?.id === s.id ? "selected" : ""}`}
                    onClick={() => setSelectedService(s)}
                    style={{
                      padding: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px"
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>{s.name}</h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Thời gian: {s.duration} phút</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                        {s.discountPrice.toLocaleString()}đ
                      </div>
                      {s.price > s.discountPrice && (
                        <div style={{ fontSize: "0.75rem", textDecoration: "line-through", color: "var(--text-disabled)" }}>
                          {s.price.toLocaleString()}đ
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : packages.length > 0 ? (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`card ${selectedService?.id === pkg.id ? "selected" : ""}`}
                onClick={() => setSelectedService({
                  id: pkg.id,
                  name: pkg.name,
                  price: pkg.price,
                  discountPrice: pkg.discountPrice,
                  duration: 60 // default duration for a package session
                })}
                style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-main)" }}>{pkg.name}</h4>
                    {pkg.description && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{pkg.description}</p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                      {pkg.discountPrice.toLocaleString()}đ
                    </div>
                    {pkg.price > pkg.discountPrice && (
                      <div style={{ fontSize: "0.75rem", textDecoration: "line-through", color: "var(--text-disabled)" }}>
                        {pkg.price.toLocaleString()}đ
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {pkg.services.map((item, idx) => (
                    <span key={idx} className="badge badge-pending" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                      {item.name} x{item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
              Không có gói liệu trình nào tại chi nhánh này.
            </div>
          )}

          {/* Action buttons */}
          <div style={{ marginTop: "24px", paddingBottom: "20px" }}>
            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
              disabled={!selectedService}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Chọn Stylist / Kỹ Thuật Viên */}
      {step === 2 && (
        <div className="animate-slide-up" style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--text-main)" }}>Bước 2: Chọn Kỹ Thuật Viên</h2>

          {/* Any Stylist Option */}
          <div
            className={`card ${selectedStaff?.id === "any" ? "selected" : ""}`}
            onClick={() => setSelectedStaff({ id: "any", name: "Kỹ thuật viên ngẫu nhiên" })}
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "12px",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--primary-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#ffffff"
              }}
            >
              AUTO
            </div>
            <div>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>Kỹ thuật viên bất kỳ</h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Salon sẽ sắp xếp thợ rảnh tối ưu thời gian cho bạn</p>
            </div>
          </div>

          {/* Staff members list */}
          {staffList.length > 0 ? (
            <div>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "16px 0 8px" }}>Chọn thợ bạn yêu thích:</h3>
              {staffList.map((st) => (
                <div
                  key={st.id}
                  className={`card ${selectedStaff?.id === st.id ? "selected" : ""}`}
                  onClick={() => setSelectedStaff({ id: st.id, name: st.name })}
                  style={{
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "8px",
                    cursor: "pointer"
                  }}
                >
                  <img
                    src={st.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={st.name}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: selectedStaff?.id === st.id ? "2px solid var(--primary)" : "1px solid var(--border-color)"
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{st.name}</h4>
                    {st.note && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{st.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Chi nhánh hiện chưa cập nhật danh sách nhân viên riêng lẻ. Bạn có thể chọn ngẫu nhiên.
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingBottom: "20px" }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              Quay lại
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary">
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Chọn Ngày & Giờ trống */}
      {step === 3 && (
        <div className="animate-slide-up" style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--text-main)" }}>Bước 3: Chọn Ngày & Giờ</h2>

          {/* Calendar Strip */}
          <label className="form-label" style={{ marginBottom: "10px" }}>Chọn ngày hẹn:</label>
          <div className="calendar-strip" style={{ marginBottom: "20px" }}>
            {datesList.map((day) => (
              <div
                key={day.dateStr}
                className={`calendar-day ${selectedDate === day.dateStr ? "selected" : ""}`}
                onClick={() => setSelectedDate(day.dateStr)}
              >
                <span className="calendar-weekday">{day.weekday}</span>
                <span className="calendar-date">{day.label.split("/")[0]}</span>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <label className="form-label">Chọn khung giờ trống:</label>
          {timeSlots.length > 0 ? (
            <div className="slots-grid">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`slot-item ${!slot.available ? "disabled" : ""} ${selectedTime === slot.time ? "selected" : ""}`}
                  onClick={() => {
                    if (slot.available) {
                      setSelectedTime(slot.time);
                    }
                  }}
                >
                  {slot.time}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              Đang kiểm tra lịch trống hoặc không có giờ rảnh phù hợp...
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "28px", paddingBottom: "20px" }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              Quay lại
            </button>
            <button
              onClick={() => setStep(4)}
              className="btn btn-primary"
              disabled={!selectedTime}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Xác nhận & Đăng ký thông tin */}
      {step === 4 && (
        <div className="animate-slide-up" style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--text-main)" }}>Bước 4: Nhập Thông Tin Đặt Lịch</h2>

          {/* Booking Summary Box */}
          <div className="card" style={{ background: "var(--bg-card)", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "10px" }}>
              Tóm tắt lịch hẹn
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Dịch vụ:</span>
                <span style={{ fontWeight: "600" }}>{selectedService?.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Thời lượng:</span>
                <span>{selectedService?.duration} phút</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Nhân viên:</span>
                <span style={{ fontWeight: "600" }}>{selectedStaff?.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Thời gian:</span>
                <span style={{ color: "var(--primary)", fontWeight: "700" }}>
                  {selectedTime} ngày {selectedDate.split("-").reverse().join("/")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "8px", marginTop: "4px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Tổng tạm tính:</span>
                <span style={{ color: "var(--primary)", fontWeight: "800", fontSize: "1rem" }}>
                  {selectedService?.discountPrice.toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>

          {/* Input details form */}
          <form onSubmit={handleBookingSubmit}>
            <div className="form-group">
              <label className="form-label">Họ tên của bạn *</label>
              <input
                type="text"
                required
                placeholder="Nhập đầy đủ họ tên"
                className="input-field"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                type="tel"
                required
                placeholder="Số điện thoại nhận tin nhắn"
                className="input-field"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (tùy chọn)</label>
              <input
                type="email"
                placeholder="Địa chỉ email liên hệ"
                className="input-field"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Ghi chú thêm (tùy chọn)</label>
              <textarea
                placeholder="Ví dụ: Tóc mỏng, cần sấy tạo kiểu nhẹ..."
                className="input-field"
                style={{ height: "70px", resize: "none" }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {errorMsg && (
              <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "16px", textAlign: "center" }}>
                {errorMsg}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", paddingBottom: "20px" }}>
              <button type="button" onClick={() => setStep(3)} className="btn btn-secondary">
                Quay lại
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Đang xử lý..." : "Xác nhận & Đặt lịch"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success View */}
      {step === 5 && successDetails && (
        <div className="animate-slide-up" style={{ textAlign: "center", padding: "30px 10px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="success-checkmark">✓</div>
          <h2 style={{ fontSize: "1.4rem", color: "var(--text-main)", marginBottom: "8px" }}>Đặt Lịch Thành Công!</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "24px" }}>
            Mã đặt lịch của bạn đã được khởi tạo ở trạng thái Chờ xác nhận (PENDING).
          </p>

          <div className="card" style={{ textAlign: "left", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.3)", fontSize: "0.85rem", marginBottom: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div><strong style={{ color: "var(--text-muted)" }}>Khách hàng:</strong> {successDetails.customer.name} ({successDetails.customer.phone})</div>
              <div><strong style={{ color: "var(--text-muted)" }}>Chi nhánh:</strong> {successDetails.branchName}</div>
              <div><strong style={{ color: "var(--text-muted)" }}>Dịch vụ:</strong> {successDetails.serviceName}</div>
              <div><strong style={{ color: "var(--text-muted)" }}>Stylist:</strong> {successDetails.staffName}</div>
              <div><strong style={{ color: "var(--text-muted)" }}>Thời gian:</strong> <span style={{ color: "var(--primary)", fontWeight: "700" }}>{successDetails.time} - {successDetails.date.split("-").reverse().join("/")}</span></div>
              <div><strong style={{ color: "var(--text-muted)" }}>Trạng thái:</strong> <span className="badge badge-pending">{successDetails.status}</span></div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => {
                // Navigate to customer profile history using customer phone
                router.push(`/profile?phone=${successDetails.customer.phone}`);
              }}
              className="btn btn-primary"
            >
              Xem Lịch Sử Lịch Hẹn
            </button>
            <button
              onClick={() => {
                // Reset state
                setStep(1);
                setSelectedService(null);
                setSelectedTime("");
              }}
              className="btn btn-secondary"
            >
              Đặt lịch mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="container" style={{ color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>Đang tải quy trình đặt lịch...</div>}>
      <BookingWizard />
    </Suspense>
  );
}
