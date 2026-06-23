import React, { useState } from "react";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

const MOCK_SERVICES: ServiceItem[] = [
  { id: "s1", name: "Cắt tóc nam Classic", price: 120000, duration: 30, category: "Hair" },
  { id: "s2", name: "Uốn tóc xoăn Hàn Quốc", price: 450000, duration: 90, category: "Hair" },
  { id: "s3", name: "Nhuộm màu thời trang", price: 650000, duration: 120, category: "Hair" },
  { id: "s4", name: "Gội đầu dưỡng sinh thảo dược", price: 150000, duration: 45, category: "Spa" },
  { id: "s5", name: "Massage cổ vai gáy", price: 200000, duration: 45, category: "Spa" },
  { id: "s6", name: "Sơn móng gel cao cấp", price: 180000, duration: 60, category: "Nail" },
];

export default function POS() {
  const [cart, setCart] = useState<{ service: ServiceItem; quantity: number }[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const addToCart = (service: ServiceItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  const total = cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0);

  const filteredServices = MOCK_SERVICES.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "24px", height: "calc(100vh - 120px)" }}>
      {/* LEFT COLUMN: Service Selection */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", paddingRight: "8px" }}>
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Tìm kiếm dịch vụ hoặc sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flexGrow: 1 }}
            />
            <select
              className="form-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: "150px" }}
            >
              <option value="All">Tất cả danh mục</option>
              <option value="Hair">Tóc (Hair)</option>
              <option value="Spa">Gội & Spa</option>
              <option value="Nail">Móng (Nail)</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {filteredServices.map((service) => (
            <div key={service.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "16px" }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "8px" }}>{service.category}</span>
                <h4 style={{ fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}>{service.name}</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "12px" }}>⏱️ {service.duration} phút</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "700", color: "var(--color-primary)" }}>{service.price.toLocaleString("vi-VN")}đ</span>
                <button className="btn btn-primary" onClick={() => addToCart(service)} style={{ padding: "6px 12px", borderRadius: "8px" }}>
                  + Thêm
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Invoice / Cart */}
      <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px" }}>
        <h3 className="card-title" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "12px" }}>
          🛒 Hóa đơn thanh toán
        </h3>

        <div style={{ flexGrow: 1, overflowY: "auto", marginBottom: "20px" }}>
          {cart.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
              <span style={{ fontSize: "40px" }}>🧾</span>
              <p style={{ marginTop: "12px" }}>Chưa chọn dịch vụ nào.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cart.map((item) => (
                <div key={item.service.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px dashed var(--border-color)" }}>
                  <div>
                    <div style={{ fontWeight: "600" }}>{item.service.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {item.service.price.toLocaleString("vi-VN")}đ x {item.quantity}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: "600" }}>{(item.service.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeFromCart(item.service.id)}
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Tạm tính:</span>
            <span style={{ fontWeight: "600" }}>{total.toLocaleString("vi-VN")}đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Thành tiền:</span>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-primary)" }}>{total.toLocaleString("vi-VN")}đ</span>
          </div>

          <button className="btn btn-primary" style={{ width: "100%", padding: "14px" }} disabled={cart.length === 0} onClick={() => alert("Đã in và thanh toán thành công!")}>
            💳 Xác nhận & In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
}
