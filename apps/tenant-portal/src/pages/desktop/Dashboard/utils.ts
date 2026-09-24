import React from "react";

/**
 * Standard Vietnamese Dong (VND) currency formatter
 */
export const formatVND = (num: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

/**
 * Standard number formatter with thousands separator
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Compact VND formatter (e.g. "1.5 Tr", "2.0 Tỷ") for tight calendar cells
 */
export const formatCompactVND = (amount: number): string => {
  if (amount === 0) return "-";
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} Tỷ`;
  }
  if (amount >= 10_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} Tr`;
  }
  return formatNumber(amount);
};

/**
 * Calculate nice round tick marks for charts (e.g. 5M, 10M, 15M)
 */
export function getNiceTicks(maxVal: number, maxTicks = 5) {
  const translationFactor = 1_000_000; // Work in Millions for cleaner math
  const maxValM = maxVal / translationFactor;
  const roughStep = maxValM / maxTicks;
  const log = Math.log10(roughStep);
  const power = Math.floor(log);
  const base = Math.pow(10, power);
  const normalized = roughStep / base;

  let niceNormalizedStep = 1;
  if (normalized < 1.5) niceNormalizedStep = 1;
  else if (normalized < 3) niceNormalizedStep = 2;
  else if (normalized < 7) niceNormalizedStep = 5;
  else niceNormalizedStep = 10;

  const niceStepM = niceNormalizedStep * base;
  const niceStep = niceStepM * translationFactor;
  const niceMax = Math.ceil(maxVal / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let val = 0; val <= niceMax; val += niceStep) {
    ticks.push(val);
  }

  return { ticks, niceMax };
}

/**
 * Multi-selection handler supporting:
 * - Ctrl/Meta: Toggle individual items
 * - Shift: Range selection between anchor and clicked item
 * - Single click: Single select or deselect if already the only selected item
 */
export interface MultiRangeSelectParams {
  event: React.MouseEvent;
  clickedKey: string;
  allKeys: string[];
  currentSelected: string;
  anchorKey: string | null;
  onSelect: (selectedStr: string) => void;
  setAnchorKey: (key: string | null) => void;
}

export function handleMultiRangeSelect({
  event,
  clickedKey,
  allKeys,
  currentSelected,
  anchorKey,
  onSelect,
  setAnchorKey,
}: MultiRangeSelectParams): void {
  const selectedList = currentSelected
    ? currentSelected.split(",").filter(Boolean)
    : [];

  let newSelected: string[] = [];

  if (event.ctrlKey || event.metaKey) {
    if (selectedList.includes(clickedKey)) {
      newSelected = selectedList.filter((k) => k !== clickedKey);
    } else {
      newSelected = [...selectedList, clickedKey];
    }
    setAnchorKey(clickedKey);
  } else if (event.shiftKey && anchorKey) {
    const anchorIndex = allKeys.indexOf(anchorKey);
    const clickedIndex = allKeys.indexOf(clickedKey);

    if (anchorIndex !== -1 && clickedIndex !== -1) {
      const start = Math.min(anchorIndex, clickedIndex);
      const end = Math.max(anchorIndex, clickedIndex);
      newSelected = allKeys.slice(start, end + 1);
    } else {
      newSelected = [clickedKey];
      setAnchorKey(clickedKey);
    }
  } else {
    if (selectedList.length === 1 && selectedList[0] === clickedKey) {
      newSelected = [];
      setAnchorKey(null);
    } else {
      newSelected = [clickedKey];
      setAnchorKey(clickedKey);
    }
  }

  onSelect(newSelected.join(","));
}
