// Points incentive system utility for localStorage
export const REPORT_REWARD = 10;

export interface UserPoints {
  totalPoints: number;
  lastUpdated: string;
}

export function getUserPoints(): UserPoints {
  if (typeof window === "undefined") {
    return { totalPoints: 0, lastUpdated: new Date().toISOString() };
  }

  const stored = localStorage.getItem("neptune_user_points");
  if (!stored) {
    return { totalPoints: 0, lastUpdated: new Date().toISOString() };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { totalPoints: 0, lastUpdated: new Date().toISOString() };
  }
}

export function addPoints(amount: number): UserPoints {
  if (typeof window === "undefined") {
    return { totalPoints: 0, lastUpdated: new Date().toISOString() };
  }

  const current = getUserPoints();
  const updated = {
    totalPoints: current.totalPoints + amount,
    lastUpdated: new Date().toISOString(),
  };

  localStorage.setItem("neptune_user_points", JSON.stringify(updated));
  return updated;
}

export function resetPoints(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("neptune_user_points");
}
