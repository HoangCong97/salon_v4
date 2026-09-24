export interface SaasPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  maxBranches: number;
  maxStaff: number;
  features: string[];
}

export interface SubscriptionData {
  tenantId: string;
  tenantName: string;
  planId: string | null;
  planName: string;
  planCode: string;
  planPrice: number;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  planStatus: string;
  maxBranches: number;
  maxStaff: number;
  currentBranchesCount: number;
  currentStaffCount: number;
  features: string[];
}

export interface CheckoutInvoice {
  amount: number;
  invoiceNumber: string;
}

export interface DailyStats {
  revenue: number;
  previous: number;
  growth: number;
}

export interface MonthlyStats {
  revenue: number;
  previous: number;
  growth: number;
}

export interface BookingsStats {
  total: number;
  completed: number;
}

export interface StaffStats {
  scheduled: number;
  active: number;
}

export interface InventoryStats {
  lowStock: number;
}

export interface MonthlyTrendItem {
  month: string;
  yearMonth: string;
  totalPrice: number;
  finalAmount: number;
  discountAmount: number;
}

export interface InvoiceItemDetail {
  id: string;
  itemId: string;
  name: string;
  itemType: string;
  price: number;
  quantity: number;
  totalPrice: number;
  discountAmount: number;
  finalAmount: number;
  staffId: string | null;
  staffName?: string | null;
  staffAvatar?: string | null;
}

export interface InvoiceDetailItem {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  totalPrice: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  time: string;
  customerName: string;
  cashierId?: string | null;
  cashierName: string;
  note: string;
  items: InvoiceItemDetail[];
}

export interface DailyRevenueItem {
  date: string;
  dateRaw: string;
  day: number;
  dayOfWeek: number; // 1 to 7
  totalPrice: number;
  finalAmount: number;
  discountAmount: number;
  invoices: InvoiceDetailItem[];
}

export interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  percentage: number;
}

export interface TopServiceData {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

export interface StaffPerformanceItem {
  staffId: string;
  staffName: string;
  revenue: number;
  totalPrice?: number;
  actualRevenue?: number;
  customers: number;
  recordCount: number;
}

export interface DashboardCharts {
  monthlyTrends: MonthlyTrendItem[];
  dailyRevenues: DailyRevenueItem[];
  paymentMethods: PaymentMethodBreakdown[];
  topServices: TopServiceData[];
  staffPerformance: StaffPerformanceItem[];
}

export interface RecentBookingItem {
  id: string;
  customerName: string;
  service: string;
  staff: string;
  time: string;
  status: string;
}

export interface DailyTurnItem {
  rank: number;
  name: string;
  avatar: string | null;
  served: number;
}

export interface DashboardStatsResponse {
  daily: DailyStats;
  monthly: MonthlyStats;
  bookings: BookingsStats;
  staff: StaffStats;
  inventory: InventoryStats;
  charts: DashboardCharts;
  recentBookings: RecentBookingItem[];
  dailyTurns: DailyTurnItem[];
}
