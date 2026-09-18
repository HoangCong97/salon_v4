import React from "react";

interface StaffAvatarItem {
  id?: string;
  name: string;
  avatar?: string;
}

interface MultiStaffAvatarProps {
  staffList: StaffAvatarItem[];
  size?: number;
}

const AVATAR_COLORS = [
  "#e11d48", // rose red
  "#d97706", // amber
  "#2563eb", // corporate blue
  "#059669", // emerald green
  "#9333ea", // purple
  "#0891b2", // cyan
  "#ca8a04", // yellow-gold
];

function getStaffColor(name: string = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function MultiStaffAvatar({
  staffList,
  size = 54,
}: MultiStaffAvatarProps) {
  // Deduplicate staff list
  const uniqueStaff = React.useMemo(() => {
    const seen = new Set<string>();
    const list: StaffAvatarItem[] = [];
    staffList.forEach((s) => {
      const key = s.id || s.name;
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push(s);
      }
    });
    return list;
  }, [staffList]);

  const count = uniqueStaff.length;

  const renderSingleAvatar = (
    staff: StaffAvatarItem,
    style?: React.CSSProperties,
    fontSize = "14px",
  ) => {
    const bg = getStaffColor(staff.name);
    const initial = staff.name ? staff.name.trim().charAt(0).toUpperCase() : "?";

    if (staff.avatar) {
      return (
        <img
          src={staff.avatar}
          alt={staff.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            ...style,
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: bg,
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700",
          fontSize,
          userSelect: "none",
          ...style,
        }}
      >
        {initial}
      </div>
    );
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        background: "hsl(215, 15%, 92%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}
    >
      {count === 0 && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `${size * 0.4}px`,
            color: "var(--text-secondary)",
            background: "#1f2937",
          }}
        >
          💈
        </div>
      )}

      {/* Case 1: 1 staff avatar */}
      {count === 1 && renderSingleAvatar(uniqueStaff[0], {}, `${size * 0.45}px`)}

      {/* Case 2: 2 staff avatars - Perfect diagonal split with centered avatars in each half */}
      {count === 2 && (
        <>
          {/* Top-Left Half */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: getStaffColor(uniqueStaff[0].name),
              clipPath: "polygon(0 0, 100% 0, 0 100%)",
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "33.3%",
                left: "33.3%",
                transform: "translate(-50%, -50%)",
                width: "50%",
                height: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: `${size * 0.28}px`,
              }}
            >
              {uniqueStaff[0].avatar ? (
                <img
                  src={uniqueStaff[0].avatar}
                  alt={uniqueStaff[0].name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              ) : (
                uniqueStaff[0].name.trim().charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Bottom-Right Half */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: getStaffColor(uniqueStaff[1].name),
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
              zIndex: 2,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "66.7%",
                left: "66.7%",
                transform: "translate(-50%, -50%)",
                width: "50%",
                height: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: `${size * 0.28}px`,
              }}
            >
              {uniqueStaff[1].avatar ? (
                <img
                  src={uniqueStaff[1].avatar}
                  alt={uniqueStaff[1].name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              ) : (
                uniqueStaff[1].name.trim().charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* White diagonal separator - clean 1px line matching 3 & 4 staff split */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            <line
              x1="100"
              y1="0"
              x2="0"
              y2="100"
              stroke="#ffffff"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </>
      )}

      {/* Case 3: 3 staff avatars - Tri-split (Top half, Bottom-left, Bottom-right) */}
      {count === 3 && (
        <div
          style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            width: "100%",
            height: "100%",
            gap: "1px",
            background: "#ffffff",
          }}
        >
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            {renderSingleAvatar(uniqueStaff[0], {}, `${size * 0.24}px`)}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1px",
              width: "100%",
              height: "100%",
            }}
          >
            <div style={{ overflow: "hidden" }}>
              {renderSingleAvatar(uniqueStaff[1], {}, `${size * 0.22}px`)}
            </div>
            <div style={{ overflow: "hidden" }}>
              {renderSingleAvatar(uniqueStaff[2], {}, `${size * 0.22}px`)}
            </div>
          </div>
        </div>
      )}

      {/* Case 4+: 4 staff avatars - 2x2 Grid (Dấu cộng split) */}
      {count >= 4 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            width: "100%",
            height: "100%",
            gap: "1px",
            background: "#ffffff",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            {renderSingleAvatar(uniqueStaff[0], {}, `${size * 0.22}px`)}
          </div>
          <div style={{ overflow: "hidden" }}>
            {renderSingleAvatar(uniqueStaff[1], {}, `${size * 0.22}px`)}
          </div>
          <div style={{ overflow: "hidden" }}>
            {renderSingleAvatar(uniqueStaff[2], {}, `${size * 0.22}px`)}
          </div>
          <div style={{ overflow: "hidden" }}>
            {renderSingleAvatar(uniqueStaff[3], {}, `${size * 0.22}px`)}
          </div>
        </div>
      )}
    </div>
  );
}
