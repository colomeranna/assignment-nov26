import { isWeekday, nthWeekday, toLocalDate, toLocalDateTime } from "./dates";
import type { Appointment } from "./types";

// 30-minute slots covering 09:00–12:30 and 15:00–17:30, every weekday.
export const SLOT_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "15:00", "15:30", "16:00", "16:30", "17:00",
] as const;

const BOOKABLE_DAY_COUNT = 5;

export type SlotStatus = "available" | "taken" | "past";

export type Slot = { time: string; status: SlotStatus };

type DayQuery = {
  appointments: readonly Appointment[];
  doctorId: string;
  date: string;
  now: Date;
};

/** The next five weekdays, starting today when today is a weekday. */
export function getBookableDays(now: Date): string[] {
  const days = isWeekday(now) ? [now] : [];
  for (let n = 1; days.length < BOOKABLE_DAY_COUNT; n++) {
    days.push(nthWeekday(now, n));
  }
  return days.map(toLocalDate);
}

export function getSlotStatus({ appointments, doctorId, date, now, time }: DayQuery & { time: string }): SlotStatus {
  const isTaken = appointments.some(
    (a) => a.doctorId === doctorId && a.date === date && a.time === time,
  );
  if (isTaken) return "taken";
  // Same fixed-width format, so string order is time order.
  if (`${date}T${time}` <= toLocalDateTime(now)) return "past";
  return "available";
}

export function getSlots(query: DayQuery): Slot[] {
  return SLOT_TIMES.map((time) => ({ time, status: getSlotStatus({ ...query, time }) }));
}
