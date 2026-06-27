import React from "react";
import { DollarSign, Users, Activity, Lock } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";

interface TenantKPIsProps {
  mrr: number;
  totalTenantsCount: number;
  activeTenantsCount: number;
  suspendedTenantsCount: number;
}

export const TenantKPIs: React.FC<TenantKPIsProps> = ({
  mrr,
  totalTenantsCount,
  activeTenantsCount,
  suspendedTenantsCount,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
      }}
    >
      {/* MRR Card */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px",
          borderLeft: "4px solid var(--color-primary)",
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-primary-light)",
            color: "var(--color-primary)",
          }}
        >
          <DollarSign size={24} />
        </div>
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Doanh Thu Phí Dịch Vụ (MRR)
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginTop: "2px",
            }}
          >
            {formatCurrencyVND(mrr)}
          </div>
        </div>
      </div>

      {/* Total Salon Card */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px",
          borderLeft: "4px solid var(--color-success)",
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-success-light)",
            color: "var(--color-success)",
          }}
        >
          <Users size={24} />
        </div>
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Tổng Số Salon
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginTop: "2px",
            }}
          >
            {totalTenantsCount} Salon
          </div>
        </div>
      </div>

      {/* Active Salon Card */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px",
          borderLeft: "4px solid var(--color-info)",
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-info-light)",
            color: "var(--color-info)",
          }}
        >
          <Activity size={24} />
        </div>
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Salon Hoạt Động
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginTop: "2px",
            }}
          >
            {activeTenantsCount} / {totalTenantsCount}
          </div>
        </div>
      </div>

      {/* Suspended Salon Card */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px",
          borderLeft: "4px solid var(--color-danger)",
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-danger-light)",
            color: "var(--color-danger)",
          }}
        >
          <Lock size={24} />
        </div>
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Đang Bị Khóa
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginTop: "2px",
            }}
          >
            {suspendedTenantsCount} Salon
          </div>
        </div>
      </div>
    </div>
  );
};
