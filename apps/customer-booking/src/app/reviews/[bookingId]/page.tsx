"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

const API_BASE = "http://localhost:3000/api/customer-portal";

function ReviewFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = params.bookingId as string;
  const phone = searchParams.get("phone") || "";

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [tenantId, setTenantId] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Load default tenant ID
  useEffect(() => {
    fetch(`${API_BASE}/tenants`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTenantId(data[0].id);
        }
      })
      .catch((err) => console.error("Error setting tenant ID:", err));
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !phone || !tenantId) {
      setStatus("error");
      setMessage("Thiếu thông tin xác thực cuộc hẹn.");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch(`${API_BASE}/bookings/${bookingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratingStars: rating,
          comment,
          phone,
          tenantId
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setStatus("success");
        setMessage(result.message || "Cảm ơn bạn đã gửi đánh giá!");
        
        // Redirect back to profile page after 2 seconds
        setTimeout(() => {
          router.push(`/profile?phone=${phone}`);
        }, 2200);
      } else {
        setStatus("error");
        setMessage(result.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setStatus("error");
      setMessage("Lỗi kết nối mạng. Không thể gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-slide-up" style={{ minHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="card" style={{ padding: "24px 20px" }}>
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div className="success-checkmark">✓</div>
            <h2 style={{ fontSize: "1.3rem", color: "var(--text-main)", marginBottom: "8px" }}>Gửi Đánh Giá Thành Công!</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "500", marginTop: "8px" }}>
              {message}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "16px" }}>
              Đang quay trở lại trang cá nhân...
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "1.2rem", color: "var(--text-main)", textAlign: "center", marginBottom: "6px" }}>
              Đánh Giá Lịch Hẹn
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "20px" }}>
              Ý kiến của bạn giúp chúng tôi cải thiện chất lượng phục vụ ngày một tốt hơn!
            </p>

            <form onSubmit={handleReviewSubmit}>
              {/* Star Selector */}
              <label className="form-label" style={{ textAlign: "center", display: "block" }}>Mức độ hài lòng của bạn:</label>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    className={`star-btn ${starValue <= (hoverRating || rating) ? "filled" : ""}`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600", marginBottom: "20px" }}>
                {rating === 5 ? "Rất hài lòng 😍" : ""}
                {rating === 4 ? "Hài lòng 😊" : ""}
                {rating === 3 ? "Bình thường 🙂" : ""}
                {rating === 2 ? "Không hài lòng 🙁" : ""}
                {rating === 1 ? "Rất tệ 😡" : ""}
              </div>

              {/* Comment field */}
              <div className="form-group">
                <label className="form-label">Nhận xét chi tiết (tùy chọn)</label>
                <textarea
                  placeholder="Chia sẻ trải nghiệm làm đẹp của bạn tại salon..."
                  className="input-field"
                  style={{ height: "100px", resize: "none" }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {status === "error" && (
                <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "16px", textAlign: "center" }}>
                  ⚠️ {message}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => router.push(`/profile?phone=${phone}`)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !phone}
                >
                  {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="container" style={{ color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>Đang tải trang đánh giá...</div>}>
      <ReviewFormContent />
    </Suspense>
  );
}
