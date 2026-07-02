import React from "react";

import styles from "../Dashboard.module.css";

export function RecentBookings() {
  return (
    <div className={`card ${styles.bookingsCard}`}>
      <h3 className="card-title">Hoạt động đặt lịch gần đây</h3>
      <div className="data-table-container">
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
            <tr>
              <td><strong>Nguyễn Văn Hùng</strong></td>
              <td>Cắt tóc nam styling</td>
              <td>Thợ A (Stylist)</td>
              <td>09:00 AM</td>
              <td><span className="badge badge-success">Đã hoàn thành</span></td>
            </tr>
            <tr>
              <td><strong>Trần Thị Lan</strong></td>
              <td>Nail Art & Gel</td>
              <td>Thợ C (Nail Tech)</td>
              <td>09:30 AM</td>
              <td><span className="badge badge-info">Đang làm</span></td>
            </tr>
            <tr>
              <td><strong>Lê Hoàng Nam</strong></td>
              <td>Uốn Hàn Quốc</td>
              <td>Thợ B (Stylist)</td>
              <td>10:30 AM</td>
              <td><span className="badge badge-warning">Chờ xác nhận</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

