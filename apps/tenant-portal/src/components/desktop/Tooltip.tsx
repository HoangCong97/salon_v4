import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  disabled = false,
  delay = 200,
}) => {
  const [active, setActive] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = rect.top - 8 + scrollY;
          left = rect.left + rect.width / 2 + scrollX;
          break;
        case "bottom":
          top = rect.bottom + 8 + scrollY;
          left = rect.left + rect.width / 2 + scrollX;
          break;
        case "left":
          top = rect.top + rect.height / 2 + scrollY;
          left = rect.left - 8 + scrollX;
          break;
        case "right":
          top = rect.top + rect.height / 2 + scrollY;
          left = rect.right + 8 + scrollX;
          break;
      }

      setCoords({ top, left });
    }
  };

  useEffect(() => {
    if (active) {
      updateCoords();
      // Listen to scroll events on all elements to ensure correct absolute position
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [active, position]);

  const showTooltip = () => {
    if (disabled || !content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActive(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Ensure children is a single React element and clone it to attach event handlers and ref
  const child = React.Children.only(children);
  const triggerElement = React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      (triggerRef as any).current = node;
      const { ref } = child as any;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      if (child.props.onMouseEnter) child.props.onMouseEnter(e);
      showTooltip();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      if (child.props.onMouseLeave) child.props.onMouseLeave(e);
      hideTooltip();
    },
    onFocus: (e: React.FocusEvent) => {
      if (child.props.onFocus) child.props.onFocus(e);
      showTooltip();
    },
    onBlur: (e: React.FocusEvent) => {
      if (child.props.onBlur) child.props.onBlur(e);
      hideTooltip();
    },
  });

  let transform = "";
  let animationName = "";
  let arrowStyle: React.CSSProperties = {
    position: "absolute",
    width: "0",
    height: "0",
    borderStyle: "solid",
  };

  switch (position) {
    case "top":
      transform = "translate(-50%, -100%)";
      animationName = "tooltip-fade-top";
      arrowStyle = {
        ...arrowStyle,
        bottom: "-4px",
        left: "50%",
        transform: "translateX(-50%)",
        borderWidth: "5px 5px 0 5px",
        borderColor: "rgba(255, 255, 255, 0.98) transparent transparent transparent",
      };
      break;
    case "bottom":
      transform = "translateX(-50%)";
      animationName = "tooltip-fade-bottom";
      arrowStyle = {
        ...arrowStyle,
        top: "-4px",
        left: "50%",
        transform: "translateX(-50%)",
        borderWidth: "0 5px 5px 5px",
        borderColor: "transparent transparent rgba(255, 255, 255, 0.98) transparent",
      };
      break;
    case "left":
      transform = "translate(-100%, -50%)";
      animationName = "tooltip-fade-left";
      arrowStyle = {
        ...arrowStyle,
        right: "-4px",
        top: "50%",
        transform: "translateY(-50%)",
        borderWidth: "5px 0 5px 5px",
        borderColor: "transparent transparent transparent rgba(255, 255, 255, 0.98)",
      };
      break;
    case "right":
      transform = "translateY(-50%)";
      animationName = "tooltip-fade-right";
      arrowStyle = {
        ...arrowStyle,
        left: "-4px",
        top: "50%",
        transform: "translateY(-50%)",
        borderWidth: "5px 5px 5px 0",
        borderColor: "transparent rgba(255, 255, 255, 0.98) transparent transparent",
      };
      break;
  }

  return (
    <>
      {triggerElement}
      {active &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
              pointerEvents: "none",
            }}
          >
            <style>{`
              @keyframes tooltip-fade-top {
                from { opacity: 0; transform: translate(-50%, -96%) scale(0.96); }
                to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
              }
              @keyframes tooltip-fade-bottom {
                from { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(0.96); }
                to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
              }
              @keyframes tooltip-fade-left {
                from { opacity: 0; transform: translate(-96%, -50%) scale(0.96); }
                to { opacity: 1; transform: translate(-100%, -50%) scale(1); }
              }
              @keyframes tooltip-fade-right {
                from { opacity: 0; transform: translateY(-50%) translateX(-4px) scale(0.96); }
                to { opacity: 1; transform: translateY(-50%) translateX(0) scale(1); }
              }
            `}</style>
            <div
              style={{
                position: "relative",
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                color: "rgba(15, 23, 42, 0.75)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: "500",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(15, 23, 42, 0.5)",
                transform,
                animation: `${animationName} 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              }}
            >
              {content}
              <div style={arrowStyle} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
