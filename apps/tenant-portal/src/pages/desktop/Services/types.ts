import React from "react";

export interface ServiceCategory {
  id: string;
  name: string;
  color: string;
  defaultCommission: number;
}

export interface Service {
  id: string;
  name: string;
  serviceCategory?: string;
  categoryId?: string;
  category?: ServiceCategory;
  price: number;
  discountPrice?: number;
  duration?: number;
  imageUrl?: string;
  branchId?: string;
  commission?: number;
  additionalPrices?: number[];
}

export const COLOR_PRESETS = [
  { value: "blue", label: "Xanh dương", bg: "hsl(210, 100%, 96%)", text: "hsl(210, 100%, 45%)", border: "hsl(210, 100%, 90%)" },
  { value: "green", label: "Xanh lá", bg: "hsl(142, 70%, 95%)", text: "hsl(142, 72%, 29%)", border: "hsl(142, 70%, 88%)" },
  { value: "orange", label: "Cam", bg: "hsl(30, 100%, 95%)", text: "hsl(30, 100%, 40%)", border: "hsl(30, 100%, 90%)" },
  { value: "red", label: "Đỏ", bg: "hsl(0, 100%, 96%)", text: "hsl(0, 100%, 45%)", border: "hsl(0, 100%, 90%)" },
  { value: "sky", label: "Xanh trời", bg: "hsl(193, 90%, 95%)", text: "hsl(193, 90%, 35%)", border: "hsl(193, 90%, 88%)" },
  { value: "purple", label: "Tím", bg: "hsl(270, 80%, 96%)", text: "hsl(270, 80%, 45%)", border: "hsl(270, 80%, 90%)" },
  { value: "pink", label: "Hồng", bg: "hsl(330, 80%, 96%)", text: "hsl(330, 80%, 45%)", border: "hsl(330, 80%, 90%)" },
  { value: "indigo", label: "Chàm", bg: "hsl(235, 80%, 96%)", text: "hsl(235, 80%, 45%)", border: "hsl(235, 80%, 90%)" },
  { value: "lime", label: "Chanh", bg: "hsl(80, 80%, 94%)", text: "hsl(80, 80%, 30%)", border: "hsl(80, 80%, 85%)" },
  { value: "teal", label: "Mòng két", bg: "hsl(170, 80%, 94%)", text: "hsl(170, 80%, 30%)", border: "hsl(170, 80%, 85%)" }
];

export const getColorStyle = (colorName: string) => {
  const preset = COLOR_PRESETS.find(c => c.value === colorName);
  if (preset) {
    return {
      backgroundColor: preset.bg,
      color: preset.text,
      borderColor: preset.border,
      borderWidth: "1px",
      borderStyle: "solid"
    };
  }
  return {
    backgroundColor: "hsl(210, 40%, 96%)",
    color: "var(--text-secondary)",
    borderColor: "hsl(210, 40%, 90%)",
    borderWidth: "1px",
    borderStyle: "solid"
  };
};

export const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export interface CustomNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}
