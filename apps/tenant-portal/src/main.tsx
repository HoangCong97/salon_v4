import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

/**
 * TanStack Query Client - Cấu hình cache mặc định cho toàn bộ app.
 * - staleTime: 30s — dữ liệu "tươi" trong 30 giây, không refetch lại
 * - gcTime: 5 phút — cache giữ trong memory 5 phút sau khi component unmount
 * - refetchOnWindowFocus: false — không tự refetch khi user chuyển tab
 * - retry: 1 — thử lại 1 lần nếu API thất bại
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
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
