/** Legacy `isDemo` flags on records; demo mode toggle removed — always production view. */

export type DemoFlag = { isDemo?: boolean };

export function isDemoMode(_settings: { demoMode?: boolean }) {
  return false;
}

export function filterDemo<T extends DemoFlag>(items: T[], _demoOn: boolean) {
  return items.filter((item) => !item.isDemo);
}

export function filterStudents(users: { role: string; isDemo?: boolean }[], _demoOn: boolean) {
  return users.filter((u) => u.role === "STUDENT" && !u.isDemo);
}
