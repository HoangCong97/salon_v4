import React from "react";
import { Scissors, Clock } from "lucide-react";
import { ServiceItem } from "./types";
import { STATUS_CFG } from "./constants";
import { hashColor, hashBg, hashBorder } from "./helpers";

interface GridServiceCardProps {
  item: ServiceItem;
  topPx: number;
  height: number;
  accentColor: string;
  bgColor: string;
  bdColor: string;
  dragActive: boolean;
  isBeingDragged: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

export function GridServiceCard({
  item, topPx, height, accentColor, bgColor, bdColor,
  dragActive, isBeingDragged,
  onDragStart, onDragEnd, onClick,
}: GridServiceCardProps) {
  const cfg = STATUS_CFG[item.status];

  const handleDragStart = (e: React.DragEvent) => {
    const ghost = document.createElement("div");
    const w = (e.currentTarget as HTMLDivElement).getBoundingClientRect().width;
    ghost.style.cssText = [
      `position:fixed;top:-9999px;left:-9999px`,
      `width:${w}px;height:${height}px`,
      `background:${bgColor}`,
      `border:1.5px solid ${bdColor}`,
      `border-left:4px solid ${accentColor}`,
      `border-radius:8px`,
      `padding:6px 10px`,
      `box-sizing:border-box`,
      `font-family:system-ui,sans-serif`,
      `overflow:hidden`,
      `box-shadow:0 6px 20px rgba(0,0,0,0.18)`,
    ].join(";");

    const cfgDot = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${cfg.dot};margin-right:5px;vertical-align:middle"></span>`;
    ghost.innerHTML = `
      <div style="display:flex;align-items:center;margin-bottom:3px">
        ${cfgDot}
        <span style="font-size:9px;font-weight:700;color:${cfg.text}">${cfg.label}</span>
      </div>
      <div style="font-size:12px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        ${item.customerName}
      </div>
      ${height >= 70 ? `<div style="font-size:10px;color:#475569;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">✂ ${item.service.name}</div>` : ""}
      ${height >= 88 ? `<div style="font-size:9px;color:#94a3b8;margin-top:3px">🕐 ${item.startTime} · ${item.service.duration}p</div>` : ""}
    `;
    document.body.appendChild(ghost);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setDragImage(ghost, Math.min(w / 2, 80), Math.min(height / 2, 30));
    setTimeout(() => document.body.removeChild(ghost), 0);
    onDragStart(e);
  };

  return (
    <div
      id={`gc-${item.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        position: "absolute",
        left: 3, right: 3,
        top: topPx,
        height,
        borderRadius: 8,
        background: bgColor,
        border: `1.5px solid ${bdColor}`,
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: `0 2px 8px ${accentColor}22`,
        padding: "5px 8px",
        cursor: isBeingDragged ? "grabbing" : "grab",
        overflow: "hidden",
        opacity: isBeingDragged ? 0.3 : 1,
        pointerEvents: dragActive && !isBeingDragged ? "none" : "auto",
        userSelect: "none",
        zIndex: 2,
        boxSizing: "border-box",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={e => {
        if (!dragActive) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = `0 4px 14px ${accentColor}44`;
          el.style.zIndex = "10";
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = `0 2px 8px ${accentColor}22`;
        el.style.zIndex = "2";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: cfg.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cfg.label}
        </span>
        <span style={{ fontSize: 8, fontWeight: 600, padding: "1px 4px", borderRadius: 10, whiteSpace: "nowrap", background: item.source === "ONLINE" ? "#ede9fe" : "#fff7ed", color: item.source === "ONLINE" ? "#6d28d9" : "#c2410c" }}>
          {item.source === "ONLINE" ? "🌐" : "🏠"}
        </span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.customerName}
      </div>
      {height >= 70 && (
        <div style={{ fontSize: 10, color: "#475569", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <Scissors size={9} style={{ marginRight: 3, verticalAlign: "middle" }} />
          {item.service.name}
        </div>
      )}
      {height >= 88 && (
        <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
          <Clock size={8} />{item.startTime} · {item.service.duration}p
        </div>
      )}
    </div>
  );
}
