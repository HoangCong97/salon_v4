import React from "react";
import { UserPlus, RefreshCw, Info, Award, Play, HelpCircle, Loader2 } from "lucide-react";

import { ExcelInput } from "../../../components/desktop/TableComponents";

import { Branch, DailyTurn } from "./types";

import styles from "./StaffManagement.module.css";

interface DailyTurnsTableProps {
  dailyTurns: DailyTurn[];
  loading: boolean;
  branches: Branch[];
  currentBranchId: string | null;
  handleOpenAddStaffToQueue: () => void;
  handleResetTurns: () => Promise<void>;
  handleAssignTurn: (staffId: string, turnType: "walkin" | "booked") => Promise<void>;
  handleInlineTurnChange: (staffId: string, field: "walkin" | "booked", valueStr: string) => void;
  handleAutoSaveTurn: (staffId: string, field: "walkin" | "booked") => Promise<void>;
  getInlineTurnValue: (turn: DailyTurn, field: "walkin" | "booked") => number;
}

export const DailyTurnsTable: React.FC<DailyTurnsTableProps> = ({
  dailyTurns,
  loading,
  branches,
  currentBranchId,
  handleOpenAddStaffToQueue,
  handleResetTurns,
  handleAssignTurn,
  handleInlineTurnChange,
  handleAutoSaveTurn,
  getInlineTurnValue,
}) => {
  const currentBranchName = branches.find((b) => b.id === currentBranchId)?.name || "Chi nhánh";

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "Chưa gán khách";
    const d = new Date(timeStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={styles.turnsContainer}>
      {/* Control Action buttons */}
      <div className={styles.turnsHeaderRow}>
        <div className={styles.turnsHeaderLeft}>
          <span className={styles.turnsTitleDesc}>
            Lịch xếp khách xoay tua hôm nay tại: <strong>{currentBranchName}</strong>
          </span>
        </div>

        <div className={styles.turnsHeaderActions}>
          <button className="btn btn-secondary" onClick={handleOpenAddStaffToQueue}>
            <UserPlus size={16} /> Thêm thợ ngoài ca
          </button>
          <button className="btn btn-danger" onClick={handleResetTurns}>
            <RefreshCw size={16} /> Reset Hàng Đợi
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.turnsLoaderWrapper}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : dailyTurns.length === 0 ? (
        <div className={`card ${styles.turnsEmptyCard}`}>
          <Info size={40} className={styles.turnsEmptyIcon} />
          <h3 className={styles.turnsEmptyTitle}>Hàng đợi xoay tua trống</h3>
          <p className={styles.turnsEmptyDesc}>
            Hôm nay không có nhân viên nào có lịch trực ca hoạt động tại chi nhánh này.
          </p>
          <button className="btn btn-primary" onClick={handleOpenAddStaffToQueue}>
            <UserPlus size={16} /> Thêm nhân viên vào hàng đợi
          </button>
        </div>
      ) : (
        <div className={`card ${styles.turnsTableCard}`}>
          <div className={`data-table-container ${styles.turnsTableContainer}`}>
            <table className="data-table">
              <thead>
                <tr>
                  <th className={styles.turnsTh} style={{ width: "100px", textAlign: "center" }}>Số TT</th>
                  <th className={styles.turnsTh} style={{ width: "240px" }}>Tên thợ</th>
                  <th className={styles.turnsTh} style={{ width: "140px" }}>Chức danh</th>
                  <th className={styles.turnsTh} style={{ width: "150px", textAlign: "center" }}>Lượt Walk-in</th>
                  <th className={styles.turnsTh} style={{ width: "150px", textAlign: "center" }}>Lượt Chỉ định (Booked)</th>
                  <th className={styles.turnsTh} style={{ width: "150px", textAlign: "center" }}>Tổng số khách</th>
                  <th className={styles.turnsTh} style={{ width: "200px" }}>Lần gán khách cuối</th>
                  <th className={styles.turnsTh} style={{ width: "240px", textAlign: "center" }}>Gán khách nhanh</th>
                </tr>
              </thead>
              <tbody>
                {dailyTurns.map((turn, index) => {
                  const isNext = index === 0; // First in queue gets "Lượt tiếp theo" highlight

                  return (
                    <tr
                      key={turn.id}
                      className={isNext ? styles.turnsTrNext : styles.turnsTr}
                    >
                      {/* 1. Queue Number / Order */}
                      <td className={styles.turnsTdCenter} style={{ fontWeight: "700" }}>
                        {isNext ? (
                          <span
                            className="badge badge-primary"
                            style={{
                              fontWeight: "800",
                              padding: "4px 10px",
                              display: "inline-flex",
                              gap: "4px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            }}
                          >
                            <Award size={12} /> Số 1
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-secondary)" }}>Số {turn.queueNumber}</span>
                        )}
                      </td>

                      {/* 2. Staff Name */}
                      <td className={styles.turnsTd} style={{ fontWeight: "600" }}>
                        {turn.staffName}
                        {isNext && (
                          <span className={styles.turnsNextBadge}>
                            ★ Lượt tiếp theo nhận khách
                          </span>
                        )}
                      </td>

                      {/* 3. Role */}
                      <td className={styles.turnsTd}>
                        <span className="badge badge-secondary" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                          {turn.role}
                        </span>
                      </td>

                      {/* 4. Walk-in turns (inline excel inputs) */}
                      <td className={styles.turnsTdNoPadding}>
                        <ExcelInput
                          type="number"
                          value={getInlineTurnValue(turn, "walkin")}
                          onChange={(val) => handleInlineTurnChange(turn.staffId, "walkin", val)}
                          onBlur={() => handleAutoSaveTurn(turn.staffId, "walkin")}
                          textAlign="center"
                          fontWeight="600"
                        />
                      </td>

                      {/* 5. Booked turns (inline excel inputs) */}
                      <td className={styles.turnsTdNoPadding}>
                        <ExcelInput
                          type="number"
                          value={getInlineTurnValue(turn, "booked")}
                          onChange={(val) => handleInlineTurnChange(turn.staffId, "booked", val)}
                          onBlur={() => handleAutoSaveTurn(turn.staffId, "booked")}
                          textAlign="center"
                          fontWeight="600"
                        />
                      </td>

                      {/* 6. Total served */}
                      <td className={styles.turnsTdCenter} style={{ fontWeight: "700", fontSize: "14px" }}>
                        {turn.totalCustomersToday}
                      </td>

                      {/* 7. Last assigned at time */}
                      <td className={styles.turnsTd} style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                        {formatTime(turn.lastAssignedAt)}
                      </td>

                      {/* 8. Quick Assign Buttons */}
                      <td style={{ padding: "4px 8px", verticalAlign: "middle" }}>
                        <div className={styles.turnsActionsWrapper}>
                          <button
                            className={`btn btn-primary ${styles.turnsActionBtn}`}
                            style={{
                              backgroundColor: isNext ? "var(--color-primary)" : "#64748b",
                            }}
                            onClick={() => handleAssignTurn(turn.staffId, "walkin")}
                            title="Nhận khách vãng lai (Tăng lượt + Đẩy xuống hàng đợi)"
                          >
                            <Play size={10} /> Khách Walk-in
                          </button>
                          <button
                            className={`btn btn-secondary ${styles.turnsActionBtn}`}
                            onClick={() => handleAssignTurn(turn.staffId, "booked")}
                            title="Nhận khách đặt trước chỉ định (Tăng lượt chỉ định)"
                          >
                            Đặt trước (Chỉ định)
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Queue guidelines explanation */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          backgroundColor: "var(--color-primary-light)",
          border: "1px solid var(--border-focus)",
        }}
      >
        <HelpCircle size={20} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-primary)" }}>Quy tắc vận hành xoay tua thợ:</h4>
          <ol
            style={{
              fontSize: "13px",
              color: "var(--text-primary)",
              marginTop: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              paddingLeft: "16px",
            }}
          >
            <li>Thợ có số lượt làm khách Walk-in ít nhất trong ngày được ưu tiên đứng lên đầu hàng đợi.</li>
            <li>
              Trong trường hợp số lượt bằng nhau, thợ có thời gian gán khách lâu hơn (hoặc chưa làm khách nào) sẽ được xếp lên trước.
            </li>
            <li>
              Khi một thợ được bấm <strong>Nhận khách Walk-in</strong>, hệ thống tự động tăng lượt Walk-in của thợ đó và đẩy họ xuống
              vị trí cuối hàng đợi một cách công bằng.
            </li>
            <li>
              Khi thợ được gán khách đặt lịch có chỉ định đích danh (Booked), bấm **Đặt trước (Chỉ định)** để cộng lượt chỉ định mà
              không làm thay đổi thứ tự xếp hàng Walk-in.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
