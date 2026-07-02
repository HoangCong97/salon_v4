import React, { useState } from "react";
import { Scissors, Clock } from "lucide-react";
import { ServiceItem } from "./types";
import { STATUS_CFG, SLOT_HEIGHT } from "./constants";

import styles from "./Appointments.module.css";

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
  onDoubleClick: () => void;
  onResize?: (id: string, newDuration: number) => void;
}

export function GridServiceCard({
  item, topPx, height, accentColor, bgColor, bdColor,
  dragActive, isBeingDragged,
  onDragStart, onDragEnd, onDoubleClick, onResize,
}: GridServiceCardProps) {
  const cfg = STATUS_CFG[item.status];

  const [isResizing, setIsResizing] = useState(false);

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

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(SLOT_HEIGHT - 6, startHeight + deltaY);
      const slots = Math.max(1, Math.round((newHeight + 6) / SLOT_HEIGHT));
      const newDuration = slots * 15; // 15 mins per slot
      if (onResize) {
        onResize(item.id, newDuration);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      id={`gc-${item.id}`}
      draggable={!isResizing}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={e => { e.stopPropagation(); onDoubleClick(); }}
      className={`${styles.gridCard} ${
        height < 40 ? styles.gridCardMiniPadding : styles.gridCardFullPadding
      }`}
      style={{
        top: topPx,
        height,
        background: bgColor,
        borderColor: bdColor,
        borderLeftColor: accentColor,
        cursor: isBeingDragged ? "grabbing" : "grab",
        opacity: isBeingDragged ? 0.3 : 1,
        pointerEvents: dragActive && !isBeingDragged ? "none" : "auto",
        ["--accent-shadow-color" as any]: `${accentColor}22`,
        ["--accent-shadow-hover-color" as any]: `${accentColor}44`,
      }}
    >
      {/* Content wrapper with overflow hidden to keep design clean */}
      <div className={styles.gridCardInner}>
        {height < 40 ? (
          <div className={styles.gridCardInnerMini}>
            <div className={styles.gridCardDot} style={{ background: cfg.dot }} />
            <span className={styles.gridCardCustNameMini}>
              {item.customerName}
            </span>
            <span className={styles.gridCardSvcNameMini}>
              · {item.service.name}
            </span>
          </div>
        ) : (
          <>
            <div className={styles.gridCardHeader}>
              <div className={styles.gridCardDot} style={{ background: cfg.dot }} />
              <span className={styles.gridCardStatusText} style={{ color: cfg.text }}>
                {cfg.label}
              </span>
              <span className={`${styles.sourceBadge} ${
                item.source === "ONLINE" ? styles.sourceOnline : styles.sourceWalkIn
              }`}>
                {item.source === "ONLINE" ? "🌐" : "🏠"}
              </span>
            </div>
            <div className={styles.gridCardCustName}>
              {item.customerName}{height < 70 && <span className={styles.gridCardSvcNameInline}> · {item.service.name}</span>}
            </div>
            {height >= 70 && (
              <div className={styles.gridCardSvcName}>
                <Scissors size={9} style={{ marginRight: 3, verticalAlign: "middle" }} />
                {item.service.name}
              </div>
            )}
            {height >= 88 && (
              <div className={styles.gridCardTime}>
                <Clock size={8} />{item.startTime} · {item.service.duration}p
              </div>
            )}
          </>
        )}
      </div>

      {onResize && !dragActive && (
        <div
          onMouseDown={handleResizeMouseDown}
          className={styles.resizeHandle}
        />
      )}
    </div>
  );
}
