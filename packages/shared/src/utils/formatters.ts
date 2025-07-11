import {
  ACTIVITY_LABELS,
  DIAPER_TYPE_LABELS,
  FEEDING_TYPE_LABELS,
  MILESTONE_TYPE_LABELS,
  SLEEP_QUALITY_LABELS,
} from "../constants";
import type { ActivityApi } from "../schemas";

// 날짜 포맷팅
export const formatDate = (
  date: string | Date,
  format: "display" | "api" | "time" = "display",
): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  switch (format) {
    case "display":
      return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, "0")}월 ${String(d.getDate()).padStart(2, "0")}일`;
    case "api":
      return d.toISOString().split("T")[0] ?? "";
    case "time":
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    default:
      return d.toLocaleDateString("ko-KR");
  }
};

// 상대 시간 (예: "2시간 전")
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDate(date);
};

// 활동 타입 라벨
export const formatActivityType = (
  type: keyof typeof ACTIVITY_LABELS,
): string => {
  return ACTIVITY_LABELS[type] || type;
};

// 수유 타입 라벨
export const formatFeedingType = (
  type: keyof typeof FEEDING_TYPE_LABELS,
): string => {
  return FEEDING_TYPE_LABELS[type] || type;
};

// 기저귀 타입 라벨
export const formatDiaperType = (
  type: keyof typeof DIAPER_TYPE_LABELS,
): string => {
  return DIAPER_TYPE_LABELS[type] || type;
};

// 수면 품질 라벨
export const formatSleepQuality = (
  quality: keyof typeof SLEEP_QUALITY_LABELS,
): string => {
  return SLEEP_QUALITY_LABELS[quality] || quality;
};

// 마일스톤 타입 라벨
export const formatMilestoneType = (
  type: keyof typeof MILESTONE_TYPE_LABELS,
): string => {
  return MILESTONE_TYPE_LABELS[type] || type;
};

// 시간 지속시간 포맷 (분 → "1시간 30분")
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
};

// 무게 포맷 (kg)
export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(1)}kg`;
};

// 키 포맷 (cm)
export const formatHeight = (height: number): string => {
  return `${height.toFixed(1)}cm`;
};

// 나이 계산 (생년월일 → "1년 2개월")
export const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months}개월`;
  }

  if (months === 0) {
    return `${years}년`;
  }

  return `${years}년 ${months}개월`;
};

// 활동 요약 텍스트 생성
export const formatActivitySummary = (activity: ActivityApi): string => {
  const typeLabel = formatActivityType(
    activity.type.toUpperCase() as keyof typeof ACTIVITY_LABELS,
  );

  switch (activity.type) {
    case "feeding":
      if (
        activity.data &&
        typeof activity.data === "object" &&
        "type" in activity.data
      ) {
        const feedingData = activity.data;
        const parts = [
          formatFeedingType(
            feedingData.type.toUpperCase() as keyof typeof FEEDING_TYPE_LABELS,
          ),
        ];
        if (feedingData.amount) parts.push(`${feedingData.amount}ml`);
        if (feedingData.duration) parts.push(`${feedingData.duration}분`);
        return `${typeLabel} - ${parts.join(", ")}`;
      }
      return typeLabel;

    case "diaper":
      if (
        activity.data &&
        typeof activity.data === "object" &&
        "type" in activity.data
      ) {
        const diaperData = activity.data;
        return `${typeLabel} - ${formatDiaperType(diaperData.type.toUpperCase() as keyof typeof DIAPER_TYPE_LABELS)}`;
      }
      return typeLabel;

    case "sleep":
      if (
        activity.data &&
        typeof activity.data === "object" &&
        "startedAt" in activity.data
      ) {
        const sleepData = activity.data;
        if (sleepData.endedAt) {
          const duration = Math.floor(
            (new Date(sleepData.endedAt).getTime() -
              new Date(sleepData.startedAt).getTime()) /
              (1000 * 60),
          );
          const parts = [formatDuration(duration)];
          if (sleepData.quality)
            parts.push(
              formatSleepQuality(
                sleepData.quality.toUpperCase() as keyof typeof SLEEP_QUALITY_LABELS,
              ),
            );
          return `${typeLabel} - ${parts.join(", ")}`;
        }
        return `${typeLabel} - 진행 중`;
      }
      return typeLabel;

    case "tummy_time":
      if (
        activity.data &&
        typeof activity.data === "object" &&
        "duration" in activity.data
      ) {
        const tummyTimeData = activity.data;
        return `${typeLabel} - ${formatDuration(tummyTimeData.duration)}`;
      }
      return typeLabel;

    default:
      return typeLabel;
  }
};
