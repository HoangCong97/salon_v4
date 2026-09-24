import React from "react";
import { Award, UserCheck, Flame } from "lucide-react";
import { DailyTurnItem } from "../types";

interface DailyTurnsProps {
  turns: DailyTurnItem[];
}

export function DailyTurns({ turns }: DailyTurnsProps) {
  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-500 text-white shadow-xs font-black ring-2 ring-amber-300";
      case 2:
        return "bg-slate-400 text-white shadow-xs font-bold ring-2 ring-slate-300";
      case 3:
        return "bg-amber-700 text-white shadow-xs font-bold ring-2 ring-amber-600/50";
      default:
        return "bg-slate-200 text-slate-700 font-semibold";
    }
  };

  return (
    <div className="bg-white rounded-[14px] border border-slate-300 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-[46px] flex items-center justify-between px-4 border-b border-slate-300 bg-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
            <Award size={16} />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 m-0 leading-tight">
            Xếp hạng lượt phục vụ hôm nay
          </h3>
        </div>
      </div>

      {/* List */}
      <div className="p-3 flex flex-col gap-2 overflow-y-auto max-h-[380px] bg-slate-50/30">
        {turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
            <UserCheck size={32} className="text-slate-300" />
            <span className="text-xs font-bold text-slate-500">
              Không có ca trực nào được ghi nhận hôm nay.
            </span>
          </div>
        ) : (
          turns.map((t) => (
            <div
              key={t.rank}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-300 shadow-2xs hover:border-blue-300 transition-colors"
            >
              {/* Rank Badge */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${getRankBadgeClass(
                  t.rank,
                )}`}
              >
                {t.rank === 1 ? <Flame size={14} className="fill-white" /> : t.rank}
              </div>

              {/* Avatar */}
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-300 flex-shrink-0">
                  {t.name.slice(0, 1).toUpperCase()}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {t.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  Đã phục vụ: <strong className="text-slate-800">{t.served}</strong> khách
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  t.served > 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {t.served > 0 ? "Hoạt động" : "Sẵn sàng"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
