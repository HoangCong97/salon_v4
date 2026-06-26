export type AppointmentStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type AppointmentSource = "ONLINE" | "WALK_IN";
export type ViewMode = "by-staff" | "by-customer";

export interface AppointmentService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

/** One service = one independent draggable card */
export interface ServiceItem {
  id: string;
  groupId: string;
  customerName: string;
  customerPhone?: string;
  service: AppointmentService;
  staffId: string;
  startTime: string;
  date: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  note?: string;
}

export interface Staff {
  id: string;
  name: string;
  color: string;
}

export interface DragState {
  id: string;
  source: "grid" | "sidebar";
}

export interface ModalState {
  mode: "create" | "edit";
  item?: ServiceItem;
  prefill?: { staffId: string; startTime: string; date: string };
}
