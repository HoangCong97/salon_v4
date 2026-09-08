import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

/**
 * TanStack Query Client - Cấu hình cache tối ưu cho PWA Mobile & Desktop.
 * - staleTime: 5 phút — dữ liệu giữ trạng thái tươi 5 phút, không refetch lại gây mất dữ liệu khi chuyển app
 * - gcTime: 24 giờ — giữ cache trong bộ nhớ suốt phiên làm việc
 * - refetchOnWindowFocus: false — không tự refetch gây giật/chớp màn hình khi user chuyển qua app khác
 * - refetchOnReconnect: true — tự động đồng bộ khi có kết nối mạng trở lại
 * - retry: 2 — thử lại 2 lần nếu mạng chập chờn
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 24 * 60 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
