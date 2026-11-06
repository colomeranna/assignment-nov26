"use client";

import { useSyncExternalStore } from "react";
import { toLocalDateTime } from "./dates";
import { getSlotStatus } from "./schedule";
import { createSeedData } from "./seed";
import type {
  Appointment,
  BookedAppointment,
  ConsultationOutcome,
  DemoData,
  Doctor,
  Patient,
  Prescription,
  Session,
} from "./types";

const DATA_KEY = "clinic-demo-v1";
const SESSION_KEY = "clinic-demo-v1-session";
const CHANGE_EVENT = "clinic-demo-change";

// ---- Parsing: localStorage is external data, so check its shape once here.

type Fields = Record<string, unknown>;

function isFields(value: unknown): value is Fields {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function parseList<T>(value: unknown, parseItem: (item: unknown) => T | null): T[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.map(parseItem);
  return items.every((item) => item !== null) ? items.filter((item) => item !== null) : null;
}

function parseDoctor(v: unknown): Doctor | null {
  if (!isFields(v) || !isString(v.id) || !isString(v.name) || !isString(v.specialty)) return null;
  return { id: v.id, name: v.name, specialty: v.specialty };
}

function parsePatient(v: unknown): Patient | null {
  if (!isFields(v) || !isString(v.id) || !isString(v.name) || !isString(v.dateOfBirth)) return null;
  return { id: v.id, name: v.name, dateOfBirth: v.dateOfBirth };
}

function parsePrescription(v: unknown): Prescription | null {
  if (!isFields(v) || !isString(v.medication) || !isString(v.dosage) || !isString(v.duration)) return null;
  return { medication: v.medication, dosage: v.dosage, duration: v.duration };
}

function parseOutcome(v: unknown): ConsultationOutcome | null {
  if (!isFields(v) || !isString(v.diagnosis) || !isString(v.completedAt)) return null;
  if (v.prescription === undefined) return { diagnosis: v.diagnosis, completedAt: v.completedAt };
  const prescription = parsePrescription(v.prescription);
  if (prescription === null) return null;
  return { diagnosis: v.diagnosis, prescription, completedAt: v.completedAt };
}

function parseAppointment(v: unknown): Appointment | null {
  if (!isFields(v)) return null;
  const { id, patientId, doctorId, date, time, reason, createdAt } = v;
  if (!isString(id) || !isString(patientId) || !isString(doctorId)) return null;
  if (!isString(date) || !isString(time) || !isString(createdAt)) return null;
  if (reason !== undefined && !isString(reason)) return null;
  const base = { id, patientId, doctorId, date, time, reason, createdAt };
  if (v.status === "booked") return { ...base, status: "booked" };
  if (v.status === "completed") {
    const outcome = parseOutcome(v.outcome);
    return outcome === null ? null : { ...base, status: "completed", outcome };
  }
  return null;
}

function parseDemoData(v: unknown): DemoData | null {
  if (!isFields(v)) return null;
  const doctors = parseList(v.doctors, parseDoctor);
  const patients = parseList(v.patients, parsePatient);
  const appointments = parseList(v.appointments, parseAppointment);
  if (doctors === null || patients === null || appointments === null) return null;
  return { doctors, patients, appointments };
}

function parseSession(v: unknown): Session | null {
  if (!isFields(v)) return null;
  if (v.role === "patient" && isString(v.patientId)) return { role: "patient", patientId: v.patientId };
  if (v.role === "doctor" && isString(v.doctorId)) return { role: "doctor", doctorId: v.doctorId };
  return null;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---- Reading and writing. Snapshots are cached by raw string so
// useSyncExternalStore gets the same object until the stored value changes.

function notifyChange(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
  notifyChange();
}

let dataCache: { raw: string; data: DemoData } | null = null;

function readData(): DemoData {
  const raw = localStorage.getItem(DATA_KEY);
  if (raw !== null && dataCache?.raw === raw) return dataCache.data;
  const data = raw === null ? null : parseDemoData(parseJson(raw));
  if (raw === null || data === null) {
    // Missing or unreadable: start the demo fresh.
    const seeded = createSeedData(new Date());
    localStorage.setItem(DATA_KEY, JSON.stringify(seeded));
    return readData();
  }
  dataCache = { raw, data };
  return data;
}

let sessionCache: { raw: string | null; session: Session | null } | null = null;

function readSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (sessionCache?.raw === raw) return sessionCache.session;
  const session = raw === null ? null : parseSession(parseJson(raw));
  sessionCache = { raw, session };
  return session;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export type DemoState =
  | { kind: "loading" }
  | { kind: "ready"; data: DemoData; session: Session | null };

/**
 * Client-only view of the demo data and session. The server snapshot is
 * "loading", so the first client render matches the server HTML and the real
 * data appears right after mount.
 */
export function useDemo(): DemoState {
  const data = useSyncExternalStore(subscribe, readData, () => null);
  const session = useSyncExternalStore(subscribe, readSession, () => undefined);
  if (data === null || session === undefined) return { kind: "loading" };
  return { kind: "ready", data, session };
}

// ---- Actions

export function setSession(session: Session): void {
  write(SESSION_KEY, session);
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
  notifyChange();
}

export function resetDemoData(): void {
  write(DATA_KEY, createSeedData(new Date()));
}

export type BookingRequest = Pick<BookedAppointment, "patientId" | "doctorId" | "date" | "time" | "reason">;

export type BookingResult =
  | { kind: "booked"; appointment: BookedAppointment }
  | { kind: "unavailable" };

export function bookAppointment(request: BookingRequest): BookingResult {
  const now = new Date();
  // Re-read storage: another tab may have taken the slot since the page rendered.
  const data = readData();
  const status = getSlotStatus({ appointments: data.appointments, ...request, now });
  if (status !== "available") {
    // The page may be showing stale slots; have every view re-read storage.
    notifyChange();
    return { kind: "unavailable" };
  }

  const appointment: BookedAppointment = {
    ...request,
    id: `a-${crypto.randomUUID()}`,
    status: "booked",
    createdAt: toLocalDateTime(now),
  };
  write(DATA_KEY, { ...data, appointments: [...data.appointments, appointment] });
  return { kind: "booked", appointment };
}
