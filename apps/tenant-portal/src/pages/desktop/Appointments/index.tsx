import React from "react";
import {
  CalendarClock, ChevronLeft, ChevronRight, Plus,
  Clock, Phone, Loader2, Scissors,
  Globe, Home, Users, User,
} from "lucide-react";

import {
  ViewMode, AppointmentStatus,
} from "./types";

import {
  SLOT_HEIGHT, TIME_COL_W, STATUS_CFG, TOTAL_SLOTS, START_HOUR, END_HOUR,
} from "./constants";

import {
  toLocalDateStr, hashColor, hashBg, hashBorder, timeToSlot, slotToTime,
  durationSlots, getInitials, fmtDateVN, getClosestTimeOption,
} from "./helpers";

import { GridServiceCard } from "./GridServiceCard";
import { ServiceModal } from "./ServiceModal";

import { useAppointments } from "./useAppointments";

import styles from "./Appointments.module.css";

export default function Appointments() {
  const {
    currentBranchId,
    currentTenantId,
    selectedDate,
    setSelectedDate,
    items,
    staffList,
    serviceList,
    viewMode,
    setViewMode,
    dragState,
    setDragState,
    dragOverKey,
    setDragOverKey,
    modal,
    setModal,
    selectedCustomer,
    setSelectedCustomer,
    gridScrollRef,
    sidebarScrollRef,
    handleGridScroll,
    handleSidebarScroll,
    isToday,
    currentTimePx,
    nowLabel,
    loading,
    todayItems,
    customerList,
    customerItems,
    selCust,
    staffCols,
    customerCols,
    activeCols,
    colW,
    occupiedBodySlots,
    isSlotRangeBlocked,
    getColors,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleModalSave,
    handleCardResize,
    timeSlots,
    gridH,
    navigateDate,
    handleDelete,
    scrollToCurrentTime,
    customerColorsMap,
  } = useAppointments();

  return (
    <div className={styles.container}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes now-blink{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>

      {/* ══ Row 1: Left Page Header & Right Customer Tabs Header ═══════════════════ */}
      <div className={styles.rowHeaderLayout}>
        {/* Left Page Header */}
        <div className={styles.leftPageHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div className={styles.headerIconWrapper}>
              <CalendarClock size={19} color="white" />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Lịch hẹn</h1>
              <p className={styles.headerSub}>Quản lý lịch hẹn · Kéo thả để xếp lịch</p>
            </div>
          </div>

          <div className={styles.dateNavigator}>
            <button onClick={() => navigateDate(-1)} className={styles.arrowBtn}>
              <ChevronLeft size={16} />
            </button>
            <div
              className={`${styles.dateText} ${
                isToday ? styles.dateTextToday : styles.dateTextNotToday
              }`}
            >
              {fmtDateVN(selectedDate)}
            </div>
            <button onClick={() => navigateDate(1)} className={styles.arrowBtn}>
              <ChevronRight size={16} />
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(toLocalDateStr(new Date()))}
                className={styles.todayNavBtn}
              >
                Hôm nay
              </button>
            )}
          </div>

          <div className={styles.viewModeSelector}>
            {([
              { mode: "by-staff" as ViewMode, icon: Users, label: "Theo nhân viên" },
              { mode: "by-customer" as ViewMode, icon: User, label: "Theo khách hàng" },
            ] as { mode: ViewMode; icon: React.ComponentType<any>; label: string }[]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`${styles.viewModeBtn} ${
                  viewMode === mode ? styles.viewModeBtnActive : styles.viewModeBtnInactive
                }`}
              >
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {/* Status badges + Add Button on the right */}
          <div className={styles.statusActionGroup}>
            {/* Status badges */}
            <div className={styles.statusBadgesContainer}>
              {(["PENDING", "CONFIRMED", "IN_PROGRESS"] as AppointmentStatus[]).map(s => {
                const cnt = todayItems.filter(i => i.status === s).length;
                const cfg = STATUS_CFG[s];
                return (
                  <div
                    key={s}
                    className={styles.statusBadge}
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <div className={styles.statusDot} style={{ background: cfg.dot }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: cfg.text }}>{cnt}</span>
                  </div>
                );
              })}
            </div>

            {/* Add appointment button */}
            <button
              onClick={() => setModal({
                mode: "create",
                prefill: {
                  staffId: "",
                  startTime: getClosestTimeOption(START_HOUR, END_HOUR),
                  date: selectedDate
                }
              })}
              className={styles.addAppointmentBtn}
            >
              <Plus size={14} />Thêm lịch hẹn
            </button>
          </div>
        </div>

        {/* Right Customer Tabs Header */}
        <div className={styles.rightCustomerTabsHeader}>
          <div className={styles.waitingListLabel}>
            DANH SÁCH KHÁCH CHỜ
          </div>
          <div className={styles.waitingListScrollable}>
            {customerList.map(cust => {
              const active = selectedCustomer === cust.id;
              const colors = customerColorsMap.get(cust.id) ?? {
                accentColor: hashColor(cust.name),
                bgColor: hashBg(cust.name),
                bdColor: hashBorder(cust.name)
              };
              const cc = colors.accentColor;
              return (
                <button
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust.id);
                    const targetScrollTop = cust.earliest * SLOT_HEIGHT - 40;
                    if (gridScrollRef.current) gridScrollRef.current.scrollTop = Math.max(0, targetScrollTop);
                    if (sidebarScrollRef.current) sidebarScrollRef.current.scrollTop = Math.max(0, targetScrollTop);
                  }}
                  className={styles.waitingCustomerBtn}
                  style={{
                    border: active ? `1px solid ${cc}` : "1px solid #64748b",
                    background: active ? cc + "18" : "transparent",
                  }}
                >
                  <span
                    className={styles.waitingCustomerName}
                    style={{ color: active ? cc : "#64748b" }}
                  >
                    {cust.name.split(" ").pop()}
                  </span>
                </button>
              );
            })}
            {customerList.length === 0 && <div className={styles.emptyWaitingText}>Chưa có lịch hẹn</div>}
          </div>
        </div>
      </div>

      {/* ══ Row 2: Left Legend & Right Selected Customer Info ══════════════════════ */}
      <div className={styles.rowLegendLayout}>
        {/* Left Legend */}
        <div className={styles.leftLegend}>
          {viewMode === "by-staff" ? (
            <>
              <span className={styles.legendTitle}>Màu = khách hàng:</span>
              {customerCols.slice(0, 8).map(c => {
                const cc = customerColorsMap.get(c.id)?.accentColor ?? hashColor(c.name);
                return (
                  <div key={c.id} className={styles.legendItem}>
                    <div className={styles.legendColorBox} style={{ background: cc }} />
                    <span className={styles.legendText}>{c.name}</span>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <span className={styles.legendTitle}>Màu = nhân viên:</span>
              {staffList.filter(s => todayItems.some(i => i.staffId === s.id)).map(s => (
                <div key={s.id} className={styles.legendItem}>
                  <div className={styles.legendColorBox} style={{ background: s.color }} />
                  <span className={styles.legendText}>{s.name}</span>
                </div>
              ))}
            </>
          )}

          {/* Current Time Line Legend on the right */}
          <div
            className={styles.currentTimeLegend}
            style={{ cursor: "pointer" }}
            onClick={scrollToCurrentTime}
            title="Click để cuộn tới giờ hiện tại"
          >
            <div className={styles.currentTimeLineBox} />
            <div className={styles.currentTimeDotBox} />
            <span className={styles.currentTimeText}>Giờ hiện tại</span>
          </div>
        </div>

        {/* Right Selected Customer Info */}
        <div className={styles.rightCustomerInfo}>
          {selCust ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
              <div className={styles.customerNameInfo}>
                {selCust.name}
              </div>
              {selCust.phone && (
                <div className={styles.customerPhoneInfo}>
                  <Phone size={11} />{selCust.phone}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyCustomerInfo}>Chưa chọn khách hàng</div>
          )}
        </div>
      </div>

      {/* ══ Row 3: Grid (Left) & Timeline (Right) ══════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Grid Container */}
        <div
          ref={gridScrollRef}
          onScroll={handleGridScroll}
          className={styles.gridScrollContainer}
        >
          {/* Loading overlay – grid stays mounted underneath */}
          {loading && (
            <div className={styles.loadingOverlay}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />Đang tải lịch hẹn...
            </div>
          )}
          <>
            {/* Sticky column headers */}
            <div className={styles.stickyColumnHeaders}>
              <div className={styles.timeHeaderCell}>
                <Clock size={14} color="var(--text-muted)" />
              </div>
              {viewMode === "by-staff"
                ? staffCols.map(s => (
                  <div
                    key={s.id}
                    className={styles.columnHeaderCell}
                    style={{ borderTop: `3px solid ${s.color}`, width: colW }}
                  >
                    <div
                      className={styles.staffHeaderAvatar}
                      style={{
                        background: `linear-gradient(135deg,${s.color}cc,${s.color}88)`,
                        boxShadow: `0 2px 8px ${s.color}44`,
                      }}
                    >
                      {getInitials(s.name)}
                    </div>
                    <div className={styles.staffHeaderInfo}>
                      <div className={styles.staffHeaderName}>{s.name}</div>
                      <div className={styles.staffHeaderSub}>
                        {todayItems.filter(i => i.staffId === s.id && i.status !== "CANCELLED").length} DV
                      </div>
                    </div>
                  </div>
                ))
                : customerCols.map(c => {
                  const colors = customerColorsMap.get(c.id) ?? {
                    accentColor: hashColor(c.name),
                    bgColor: hashBg(c.name),
                    bdColor: hashBorder(c.name)
                  };
                  const cc = colors.accentColor;
                  return (
                    <div
                      key={c.id}
                      className={styles.columnHeaderCell}
                      style={{ borderTop: `3px solid ${cc}`, width: colW }}
                    >
                      <div
                        className={styles.customerHeaderAvatar}
                        style={{
                          background: colors.bgColor,
                          border: `2px solid ${colors.bdColor}`,
                          color: cc,
                        }}
                      >
                        {getInitials(c.name)}
                      </div>
                      <div className={styles.staffHeaderInfo}>
                        <div className={styles.staffHeaderName}>{c.name}</div>
                        {c.phone && <div className={styles.staffHeaderSub}>{c.phone}</div>}
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {/* Grid body */}
            <div className={styles.gridBody}>
              {/* Current time line */}
              {isToday && currentTimePx >= 0 && (
                <div className={styles.currentTimeLine} style={{ top: currentTimePx }}>
                  <div className={styles.currentTimeLineDot} />
                  <div className={styles.currentTimeLineLabel}>{nowLabel}</div>
                </div>
              )}

              {/* Time gutter */}
              <div className={styles.timeGutter}>
                {timeSlots.map(slot => (
                  <div
                    key={slot}
                    className={styles.timeGutterCell}
                    style={{
                      borderBottom: (slot + 1) % 4 === 0 ? "1px solid var(--border-color)" : "1px dashed var(--border-color)",
                    }}
                  >
                    {slot % 4 === 0 && <span className={styles.timeGutterLabel}>{slotToTime(slot)}</span>}
                  </div>
                ))}
              </div>

              {/* Columns */}
              {activeCols.map(col => {
                const colId = col.id;
                const colItems = todayItems.filter(item =>
                  viewMode === "by-staff" ? item.staffId === colId : item.groupId === colId
                );

                return (
                  <div
                    key={colId}
                    onDragOver={e => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const slot = Math.floor(y / SLOT_HEIGHT);
                      if (slot >= 0 && slot < TOTAL_SLOTS) {
                        setDragOverKey(`${colId}:${slot}`);
                      }
                    }}
                    onDragLeave={e => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverKey(null);
                      }
                    }}
                    onDrop={e => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const slot = Math.floor(y / SLOT_HEIGHT);
                      if (slot >= 0 && slot < TOTAL_SLOTS) {
                        const draggedItem = items.find(i => i.id === dragState?.id);
                        const slotsNeeded = draggedItem ? durationSlots(draggedItem.service.duration) : 1;
                        const blocked = isSlotRangeBlocked(colId, slot, slotsNeeded, dragState?.id ?? "");
                        if (!blocked) {
                          handleDrop(colId, slot);
                        }
                      }
                      setDragOverKey(null);
                    }}
                    className={styles.gridColumn}
                    style={{ width: colW, height: gridH }}
                  >
                    {/* Layer 1: Background slots for grid lines & drop hover */}
                    {timeSlots.map(slot => {
                      const cellKey = `${colId}:${slot}`;
                      const isHour = (slot + 1) % 4 === 0;
                      const draggedItem = items.find(i => i.id === dragState?.id);
                      const slotsNeeded = draggedItem ? durationSlots(draggedItem.service.duration) : 1;

                      let isHighlightedTarget = false;
                      let highlightBlocked = false;

                      if (dragState && dragOverKey) {
                        const [overColId, overSlotStr] = dragOverKey.split(":");
                        const overSlot = parseInt(overSlotStr, 10);
                        if (overColId === colId && slot >= overSlot && slot < overSlot + slotsNeeded) {
                          isHighlightedTarget = true;
                          highlightBlocked = isSlotRangeBlocked(colId, overSlot, slotsNeeded, dragState.id);
                        }
                      }

                      return (
                        <div
                          key={slot}
                          className={styles.gridBgCell}
                          style={{
                            top: slot * SLOT_HEIGHT,
                            borderBottom: isHour ? "1px solid var(--border-color)" : "1px dashed var(--border-color)",
                            background: isHighlightedTarget
                              ? (highlightBlocked ? "rgba(239,68,68,0.07)" : "rgba(99,102,241,0.08)")
                              : "transparent",
                          }}
                        >
                          {isHighlightedTarget && slot === parseInt(dragOverKey!.split(":")[1], 10) && (
                            <div
                              className={styles.highlightOverlay}
                              style={{
                                height: slotsNeeded * SLOT_HEIGHT - 4,
                                border: `2px dashed ${highlightBlocked ? "var(--color-danger)" : "var(--color-primary)"}`,
                                background: highlightBlocked ? "rgba(239,68,68,0.05)" : "rgba(99,102,241,0.02)",
                              }}
                            >
                              <span
                                className={styles.highlightText}
                                style={{
                                  color: highlightBlocked ? "var(--color-danger)" : "var(--color-primary)",
                                }}
                              >
                                {highlightBlocked ? "Không thể xếp" : "Thả vào đây"}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Layer 2: Appointment cards */}
                    {colItems.map(item => {
                      const startSlot = timeToSlot(item.startTime);
                      const topPx = startSlot * SLOT_HEIGHT + 3;
                      const height = durationSlots(item.service.duration) * SLOT_HEIGHT - 6;
                      const colors = getColors(item);
                      return (
                        <GridServiceCard
                          key={item.id}
                          item={item}
                          topPx={topPx}
                          height={height}
                          {...colors}
                          dragActive={!!dragState}
                          isBeingDragged={dragState?.id === item.id}
                          onDragStart={e => handleDragStart(e, item.id, "grid")}
                          onDragEnd={handleDragEnd}
                          onDoubleClick={() => setModal({ mode: "edit", item })}
                          onResize={handleCardResize}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        </div>

        {/* Right Timeline Container */}
        <div
          ref={sidebarScrollRef}
          onScroll={handleSidebarScroll}
          className={styles.rightTimelineContainer}
        >
          {/* Sticky Header Spacer */}
          <div className={styles.timelineStickyHeader}>
            <span className={styles.timelineStickyHeaderText}>
              Kéo và thả dịch vụ vào lịch hẹn chính!
            </span>
          </div>

          {/* Cards column */}
          <div className={styles.timelineBody} style={{ height: gridH }}>
            {/* Time gutter */}
            <div className={styles.timelineTimeGutter}>
              {timeSlots.map(slot => (
                <div
                  key={slot}
                  className={styles.timelineTimeCell}
                  style={{
                    borderBottom: (slot + 1) % 4 === 0 ? "1px solid var(--border-color)" : "1px dashed var(--border-color)",
                  }}
                >
                  {slot % 4 === 0 && <span className={styles.timeGutterLabel}>{slotToTime(slot)}</span>}
                </div>
              ))}
            </div>

            {/* Timeline slots column */}
            <div className={styles.timelineColumn} style={{ height: gridH }}>
              {/* Background slots */}
              {timeSlots.map(slot => (
                <div
                  key={slot}
                  className={styles.timelineBgCell}
                  style={{
                    top: slot * SLOT_HEIGHT,
                    borderBottom: (slot + 1) % 4 === 0 ? "1px solid var(--border-color)" : "1px dashed var(--border-color)",
                  }}
                />
              ))}

              {/* Service cards */}
              {customerItems.map(item => {
                const startSlot = timeToSlot(item.startTime);
                const slots = durationSlots(item.service.duration);
                const topPx = startSlot * SLOT_HEIGHT + 3;
                const height = slots * SLOT_HEIGHT - 6;
                const colors = customerColorsMap.get(item.groupId) ?? {
                  accentColor: hashColor(item.customerName),
                  bgColor: hashBg(item.customerName),
                  bdColor: hashBorder(item.customerName)
                };
                const cc = colors.accentColor;
                const isBeingDragged = dragState?.id === item.id;
                const staff = staffList.find(s => s.id === item.staffId);
                const cfg = STATUS_CFG[item.status];

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={e => {
                      const ghost = document.createElement("div");
                      const w = (e.currentTarget as HTMLDivElement).getBoundingClientRect().width;
                      ghost.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${w}px;height:${height}px;background:${colors.bgColor};border:1.5px solid ${colors.bdColor};border-left:4px solid ${cc};border-radius:8px;padding:6px 10px;box-sizing:border-box;font-family:system-ui,sans-serif;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.15)`;
                      ghost.innerHTML = `<div style="font-size:12px;font-weight:700;color:#0f172a">${item.service.name}</div><div style="font-size:10px;color:#64748b;margin-top:2px">${item.customerName} · ${item.service.duration}p</div>`;
                      document.body.appendChild(ghost);
                      e.dataTransfer.setData("text/plain", item.id);
                      e.dataTransfer.setDragImage(ghost, Math.min(w / 2, 80), 20);
                      setTimeout(() => document.body.removeChild(ghost), 0);
                      handleDragStart(e, item.id, "sidebar");
                    }}
                    onDragEnd={handleDragEnd}
                    className={styles.sidebarCard}
                    style={{
                      top: topPx,
                      height,
                      background: colors.bgColor,
                      border: `1.5px solid ${colors.bdColor}`,
                      borderLeft: `4px solid ${cc}`,
                      padding: height < 40 ? "2px 6px" : "5px 8px",
                      opacity: isBeingDragged ? 0.3 : 1,
                      boxShadow: `0 2px 8px ${cc}22`,
                      pointerEvents: dragState && !isBeingDragged ? "none" : "auto",
                    }}
                  >
                    {height < 40 ? (
                      <div className={styles.sidebarCardInnerMini}>
                        <Scissors size={9} style={{ flexShrink: 0 }} />
                        <span className={styles.sidebarCardTitleMini}>
                          {item.service.name}
                        </span>
                      </div>
                    ) : (
                      <div className={styles.sidebarCardInnerFull}>
                        <div className={styles.sidebarCardTitleFull}>
                          <Scissors size={9} style={{ marginRight: 3, verticalAlign: "middle" }} />
                          {item.service.name}
                        </div>
                        {height >= 52 && (
                          <div className={styles.sidebarCardTimeFull}>
                            <Clock size={8} />{item.startTime} · {item.service.duration}p
                          </div>
                        )}
                        {height >= 70 && staff && (
                          <div
                            className={styles.sidebarCardStaffBadge}
                            style={{
                              background: staff.color + "15",
                              border: `1px solid ${staff.color}44`,
                            }}
                          >
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: staff.color,
                              }}
                            />
                            <span
                              className={styles.sidebarCardStaffName}
                              style={{ color: staff.color }}
                            >
                              {staff.name.split(" ").pop()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={styles.sidebarCardStatusDot}
                      style={{
                        top: height < 40 ? 6 : 5,
                        background: cfg.dot,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Row 4: Status bar (Left Side) & Right Bottom Spacer ════════════════════ */}
      <div
        className={styles.rowHeaderLayout}
        style={{ borderTop: "1px solid var(--border-color)" }}
      >
        <div className={styles.leftLegend} style={{ background: "var(--bg-card)" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: "2px 8px",
                borderRadius: 10,
                background: "#ede9fe",
              }}
            >
              <Globe size={10} color="#6d28d9" />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6d28d9" }}>Online</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: "2px 8px",
                borderRadius: 10,
                background: "#fff7ed",
              }}
            >
              <Home size={10} color="#c2410c" />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#c2410c" }}>Tại quầy</span>
            </div>
          </div>
        </div>
        <div className={styles.rightCustomerInfo} />
      </div>

      {/* ══ Modal ══════════════════════════════════════════════════════════════════ */}
      {modal && (
        <ServiceModal
          state={modal}
          staffList={staffList}
          serviceList={serviceList}
          onClose={() => setModal(null)}
          onSave={handleModalSave}
          onDelete={modal.mode === "edit" ? handleDelete : undefined}
        />
      )}
    </div>
  );
}

