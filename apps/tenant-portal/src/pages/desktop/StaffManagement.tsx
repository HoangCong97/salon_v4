import React from "react";

export default function StaffManagement() {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <div className="card">
        <h3 className="card-title">Danh sách nhân viên</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Số điện thoại</th>
                <th>Chức vụ</th>
                <th>Mức lương cứng</th>
                <th>Hoa hồng áp dụng</th>
                <th>Trạng thái hoạt động</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Nguyễn Văn A</strong></td>
                <td>0901234567</td>
                <td><span className="badge badge-primary">Thợ chính (Stylist)</span></td>
                <td>8,000,000đ</td>
                <td>Template thợ chính (15%)</td>
                <td><span className="badge badge-success">Đang làm việc</span></td>
              </tr>
              <tr>
                <td><strong>Trần Thị B</strong></td>
                <td>0907654321</td>
                <td><span className="badge badge-primary">Thợ phụ (Assistant)</span></td>
                <td>5,000,000đ</td>
                <td>Template thợ phụ (8%)</td>
                <td><span className="badge badge-success">Đang làm việc</span></td>
              </tr>
              <tr>
                <td><strong>Lê Văn C</strong></td>
                <td>0911223344</td>
                <td><span className="badge badge-info">Thu ngân (Cashier)</span></td>
                <td>6,500,000đ</td>
                <td>Không có hoa hồng</td>
                <td><span className="badge badge-success">Đang làm việc</span></td>
              </tr>
              <tr>
                <td><strong>Phạm Thị D</strong></td>
                <td>0988776655</td>
                <td><span className="badge badge-danger">Quản lý (Manager)</span></td>
                <td>12,000,000đ</td>
                <td>Doanh số chi nhánh (2%)</td>
                <td><span className="badge badge-warning">Nghỉ phép</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
