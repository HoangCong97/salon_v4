import { START_HOUR } from "./constants";

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


