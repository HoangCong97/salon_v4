import { ServiceItem } from "./types";
import { START_HOUR, MOCK_SERVICES } from "./constants";

/** Format a Date to "YYYY-MM-DD" using LOCAL timezone */
export const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const todayStr = () => toLocalDateStr(new Date());

export function hashColor(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},60%,50%)`;
}
export function hashBg(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},60%,96%)`;
}
export function hashBorder(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},60%,78%)`;
}

export function timeToSlot(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h - START_HOUR) * 4 + Math.floor(m / 15);
}
export function slotToTime(slot: number): string {
  const mins = START_HOUR * 60 + slot * 15;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}
/** Number of 15-min slots needed for this service duration */
export function durationSlots(mins: number): number {
  return Math.max(1, Math.ceil(mins / 15));
}
export function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
export function fmtCurrency(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
}
export function getInitials(name: string) {
  return name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();
}
export function fmtDateVN(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function getClosestTimeOption(startHour: number, endHour: number): string {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let closestOpt = `${String(startHour).padStart(2, "0")}:00`;
  let minDiff = Infinity;
  for (let h = startHour; h < endHour; h++) {
    const opts = [
      `${String(h).padStart(2, "0")}:00`,
      `${String(h).padStart(2, "0")}:15`,
      `${String(h).padStart(2, "0")}:30`,
      `${String(h).padStart(2, "0")}:45`
    ];
    for (const opt of opts) {
      const [oh, om] = opt.split(":").map(Number);
      const optMins = oh * 60 + om;
      const diff = Math.abs(nowMins - optMins);
      if (diff < minDiff) {
        minDiff = diff;
        closestOpt = opt;
      }
    }
  }
  return closestOpt;
}

export function genMockItems(date: string): ServiceItem[] {
  const mk = (id: string, groupId: string, cust: string, phone: string | undefined,
    sv: any, staffId: string, startTime: string,
    status: any, source: any): ServiceItem =>
    ({ id, groupId, customerName: cust, customerPhone: phone, service: sv, staffId, startTime, date, status, source });

  return [
    mk("i01", "g1", "Minh Tuấn", "0912345678", MOCK_SERVICES[0], "s1", "08:00", "CONFIRMED", "ONLINE"),
    mk("i02", "g1", "Minh Tuấn", "0912345678", MOCK_SERVICES[1], "s1", "08:45", "CONFIRMED", "ONLINE"),
    mk("i03", "g2", "Hải Đăng", "0987654321", MOCK_SERVICES[2], "s1", "10:00", "IN_PROGRESS", "WALK_IN"),
    mk("i04", "g3", "Lan Hương", "0909090909", MOCK_SERVICES[4], "s2", "09:00", "PENDING", "ONLINE"),
    mk("i05", "g3", "Lan Hương", "0909090909", MOCK_SERVICES[7], "s2", "09:40", "PENDING", "ONLINE"),
    mk("i06", "g4", "Quỳnh Anh", undefined, MOCK_SERVICES[3], "s2", "12:00", "CONFIRMED", "ONLINE"),
    mk("i07", "g5", "Bá Dũng", undefined, MOCK_SERVICES[0], "", "08:30", "DONE", "WALK_IN"),
    mk("i08", "g6", "Thu Nga", "0932109876", MOCK_SERVICES[5], "s3", "11:00", "CONFIRMED", "ONLINE"),
    mk("i09", "g7", "Văn Long", undefined, MOCK_SERVICES[6], "", "10:30", "PENDING", "WALK_IN"),
    mk("i10", "g7", "Văn Long", undefined, MOCK_SERVICES[7], "", "10:50", "PENDING", "WALK_IN"),
    mk("i11", "g8", "Minh Châu", undefined, MOCK_SERVICES[1], "", "14:00", "CANCELLED", "ONLINE"),
    mk("i12", "g9", "Gia Huy", undefined, MOCK_SERVICES[0], "s5", "09:30", "CONFIRMED", "WALK_IN"),
    mk("i13", "g9", "Gia Huy", undefined, MOCK_SERVICES[4], "s5", "10:15", "CONFIRMED", "WALK_IN"),
    mk("i14", "g10", "Thảo Vy", undefined, MOCK_SERVICES[2], "s5", "13:00", "IN_PROGRESS", "ONLINE"),
    mk("i15", "g1", "Minh Tuấn", "0912345678", MOCK_SERVICES[5], "s2", "14:30", "CONFIRMED", "ONLINE"),
  ];
}
