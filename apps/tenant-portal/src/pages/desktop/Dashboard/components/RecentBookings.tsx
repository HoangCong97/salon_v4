import React from "react";

import { RecentBookingItem } from "../types";
import styles from "../Dashboard.module.css";

interface RecentBookingsProps {
  bookings: RecentBookingItem[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="badge badge-success">Đã hoàn thành</span>;
      case "CONFIRMED":
        return <span className="badge badge-primary">Đã xác nhận</span>;
      case "PENDING":
        return <span className="badge badge-warning">Chờ xác nhận</span>;
      case "CANCELLED":
        return <span className="badge badge-danger">Đã hủy</span>;
      case "NO_SHOW":
        return <span className="badge badge-danger">Không đến</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className={`card ${styles.bookingsCard}`}>
      <h3 className="card-title">Hoạt động đặt lịch gần đây</h3>
      <div className="data-table-container">
        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
            Không có lịch hẹn nào được ghi nhận gần đây.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Kỹ thuật viên</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.customerName}</strong></td>
                  <td>{b.service}</td>
                  <td>{b.staff}</td>
                  <td>{b.time}</td>
                  <td>{getStatusBadge(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


