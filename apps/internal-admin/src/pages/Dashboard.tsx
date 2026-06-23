import React, { useState, useEffect } from "react";
import { Users, DollarSign, Activity, Calendar, ShieldCheck, TrendingUp } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";

const Dashboard: React.FC = () => {
  // State for database analytics data
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsRes = await fetch("http://localhost:3000/api/super-admin/dashboard/stats");

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setData({ stats: statsData });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute plan distribution
  let premiumCount = 42;
  let basicCount = 29;
  let freeCount = 13;

  if (data?.stats?.plansDistribution) {
    premiumCount = data.stats.plansDistribution.premium;
    basicCount = data.stats.plansDistribution.basic;
    freeCount = data.stats.plansDistribution.free;
  }

  const totalFiltered = premiumCount + basicCount + freeCount || 1;
  const premiumPct = Math.round((premiumCount / totalFiltered) * 100);
  const basicPct = Math.round((basicCount / totalFiltered) * 100);
  const freePct = 100 - premiumPct - basicPct; // make sure it sums to 100

  // KPI Metrics Data
  const stats = [
    {
      title: "Doanh thu phí dịch vụ (MRR)",
      value: data?.stats ? formatCurrencyVND(data.stats.mrr) : "0 đ",
      growth: "+12.4% so với tháng trước",
      icon: DollarSign,
      color: "var(--color-primary)",
      lightColor: "var(--color-primary-light)"
    },
    {
      title: "Tổng số Salon (Tenants)",
      value: data?.stats ? `${data.stats.totalTenants} Salon` : "0 Salon",
      growth: data?.stats ? `${data.stats.activeTenants} đang hoạt động / ${data.stats.suspendedTenants} tạm ngưng` : "0 đang hoạt động / 0 tạm ngưng",
      icon: Users,
      color: "var(--color-success)",
      lightColor: "var(--color-success-light)"
    },
    {
      title: "Chỉ số kết nối (API Uptime)",
      value: data?.stats ? data.stats.uptime : "99.98%",
      growth: "Uptime ổn định 30 ngày qua",
      icon: Activity,
      color: "var(--color-warning)",
      lightColor: "var(--color-warning-light)"
    },
    {
      title: "Lượt đặt lịch toàn sàn",
      value: data?.stats ? `${data.stats.totalBookings.toLocaleString("vi-VN")} lượt` : "0 lượt",
      growth: `Tổng cộng ${data?.stats ? data.stats.totalBranches : 0} chi nhánh`,
      icon: Calendar,
      color: "var(--color-danger)",
      lightColor: "var(--color-danger-light)"
    }
  ];

  // System logs mock data
  const recentActions = [
    { id: 1, type: "Tenant", message: "Salon 'HairSalon Việt' đăng ký dùng thử gói Basic", time: "10 phút trước", user: "Hệ thống" },
    { id: 2, type: "Billing", message: "Duyệt hóa đơn gia hạn 6 tháng cho 'BarberShop Q1'", time: "42 phút trước", user: "Hoàng Admin" },
    { id: 3, type: "Security", message: "Yêu cầu thay đổi mật khẩu từ chủ salon 'TinaSpa'", time: "2 giờ trước", user: "Hệ thống" },
    { id: 4, type: "API", message: "Cập nhật cấu hình tích hợp SMS Brandname cho 'VinaBarber'", time: "5 giờ trước", user: "Thế Anh (Manager)" }
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "400px", flexDirection: "column", gap: "12px", color: "var(--text-secondary)" }}>
        <div className="animate-spin" style={{ width: "32px", height: "32px", border: "3px solid var(--border-color)", borderTopColor: "var(--color-primary)", borderRadius: "50%" }} />
        <span style={{ fontWeight: 500, fontSize: "14px" }}>Đang tải số liệu hệ thống...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 4 columns KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card" style={{ display: "flex", alignItems: "center", gap: "16px", transition: "transform 0.15s ease" }}>
              <div
                style={{
                  backgroundColor: stat.lightColor,
                  color: stat.color,
                  borderRadius: "var(--radius-md)",
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Icon size={24} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{stat.title}</span>
                <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "2px 0 4px 0", color: "var(--text-primary)" }}>{stat.value}</h3>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <TrendingUp size={12} color="var(--color-success)" />
                  {stat.growth}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section (CSS Grid layout 2 columns) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr", gap: "20px" }}>
        
        {/* MRR Growth Chart Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "350px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 className="card-title" style={{ margin: 0 }}>Biểu đồ Tăng Trưởng Doanh Thu (MRR)</h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Năm 2026 (Triệu VNĐ)</span>
          </div>
          
          {/* Custom SVG Line Chart - Bounded inside viewBox */}
          <div style={{ flexGrow: 1, width: "100%", height: "220px", position: "relative" }}>
            <svg className="notranslate" {...({ translate: "no" } as any)} viewBox="0 0 500 200" style={{ width: "100%", height: "100%" }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="30" y1="30" x2="470" y2="30" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="30" y1="70" x2="470" y2="70" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="30" y1="110" x2="470" y2="110" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="30" y1="150" x2="470" y2="150" stroke="var(--border-color)" strokeWidth="1" />

              {/* Chart Line Path */}
              <path
                d="M 30 145 C 100 120, 150 120, 200 100 C 250 80, 300 70, 370 50 C 420 30, 440 25, 470 20"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Fill Gradient Area under path */}
              <path
                d="M 30 145 C 100 120, 150 120, 200 100 C 250 80, 300 70, 370 50 C 420 30, 440 25, 470 20 L 470 150 L 30 150 Z"
                fill="url(#chartGradient)"
              />

              {/* Data points */}
              <circle cx="30" cy="145" r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="118" cy="123" r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="206" cy="98" r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="294" cy="71" r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="382" cy="46" r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="470" cy="20" r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" />

              {/* Labels - Placed cleanly inside bounds */}
              <text x="30" y="172" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">T1</text>
              <text x="118" y="172" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">T2</text>
              <text x="206" y="172" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">T3</text>
              <text x="294" y="172" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">T4</text>
              <text x="382" y="172" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">T5</text>
              <text x="470" y="172" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">T6</text>
              
              {/* Y Axis Values */}
              <text x="24" y="34" fill="var(--text-muted)" fontSize="9" textAnchor="end">140Tr</text>
              <text x="24" y="74" fill="var(--text-muted)" fontSize="9" textAnchor="end">100Tr</text>
              <text x="24" y="114" fill="var(--text-muted)" fontSize="9" textAnchor="end">60Tr</text>
              <text x="24" y="154" fill="var(--text-muted)" fontSize="9" textAnchor="end">20Tr</text>
            </svg>
          </div>
        </div>

        {/* Tenant Distribution Subscription Gói Dịch Vụ */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "350px" }}>
          <h3 className="card-title" style={{ marginBottom: "15px" }}>Phân Bố Gói Dịch Vụ</h3>
          
          {/* Side-by-side Flexbox layout */}
          <div style={{ flexGrow: 1, display: "flex", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
            
            {/* Left side Donut */}
            <div style={{ width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg className="notranslate" {...({ translate: "no" } as any)} width="120" height="120" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                {/* Red - Free Plan */}
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--color-danger)" strokeWidth="4.2" strokeDasharray={`${freePct} ${100 - freePct}`} strokeDashoffset="0" />
                {/* Yellow - Basic Plan */}
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--color-warning)" strokeWidth="4.2" strokeDasharray={`${basicPct} ${100 - basicPct}`} strokeDashoffset={`-${freePct}`} />
                {/* Blue - Premium Plan */}
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--color-primary)" strokeWidth="4.2" strokeDasharray={`${premiumPct} ${100 - premiumPct}`} strokeDashoffset={`-${freePct + basicPct}`} />
              </svg>
            </div>
            
            {/* Right side Legends */}
            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary)", display: "inline-block" }} />
                  Premium ({premiumPct}%)
                </span>
                <span style={{ fontWeight: 600, paddingLeft: "14px", color: "var(--text-secondary)" }}>{premiumCount} Salon</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-warning)", display: "inline-block" }} />
                  Basic ({basicPct}%)
                </span>
                <span style={{ fontWeight: 600, paddingLeft: "14px", color: "var(--text-secondary)" }}>{basicCount} Salon</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-danger)", display: "inline-block" }} />
                  Free Trial ({freePct}%)
                </span>
                <span style={{ fontWeight: 600, paddingLeft: "14px", color: "var(--text-secondary)" }}>{freeCount} Salon</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Log events and platform status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Recent Audit Log events */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <ShieldCheck size={18} color="var(--color-primary)" />
            Hoạt Động Gần Đây
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
            {recentActions.map((action) => (
              <div
                key={action.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-color)"
                }}
              >
                <span
                  className="badge"
                  style={{
                    backgroundColor: action.type === "Tenant" ? "var(--color-primary-light)" : action.type === "Billing" ? "var(--color-success-light)" : "var(--color-danger-light)",
                    color: action.type === "Tenant" ? "var(--color-primary)" : action.type === "Billing" ? "var(--color-success)" : "var(--color-danger)",
                    fontSize: "10px",
                    fontWeight: 600,
                    width: "60px",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  {action.type}
                </span>
                <div style={{ flexGrow: 1 }}>
                  <p style={{ fontSize: "13px", color: "var(--text-primary)", margin: "0 0 2px 0", fontWeight: 500 }}>{action.message}</p>
                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span>{action.time}</span>
                    <span>•</span>
                    <span>Thực hiện bởi: {action.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health / API connection metrics */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 className="card-title" style={{ marginBottom: "16px" }}>Trạng Thái Kết Nối API & Đối Tác</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flexGrow: 1 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                <span>Database PostgreSQL (Supabase Connection)</span>
                <span style={{ color: "var(--color-success)", fontWeight: 600 }}>Hoạt động tốt (Uptime 100%)</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "var(--border-color)", borderRadius: "var(--radius-full)" }}>
                <div style={{ height: "6px", backgroundColor: "var(--color-success)", borderRadius: "var(--radius-full)", width: "100%" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                <span>Twilio SMS Gateway API</span>
                <span style={{ color: "var(--color-success)", fontWeight: 600 }}>Tốt (Ping: 42ms)</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "var(--border-color)", borderRadius: "var(--radius-full)" }}>
                <div style={{ height: "6px", backgroundColor: "var(--color-success)", borderRadius: "var(--radius-full)", width: "98%" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                <span>SendGrid Email API Service</span>
                <span style={{ color: "var(--color-success)", fontWeight: 600 }}>Tốt (Ping: 35ms)</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "var(--border-color)", borderRadius: "var(--radius-full)" }}>
                <div style={{ height: "6px", backgroundColor: "var(--color-success)", borderRadius: "var(--radius-full)", width: "99%" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                <span>VNPAY Payment IPN Gateway</span>
                <span style={{ color: "var(--color-warning)", fontWeight: 600 }}>Phản hồi chậm (Ping: 450ms)</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "var(--border-color)", borderRadius: "var(--radius-full)" }}>
                <div style={{ height: "6px", backgroundColor: "var(--color-warning)", borderRadius: "var(--radius-full)", width: "65%" }} />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
