import { isWeekday, nthWeekday, toLocalDate, toLocalDateTime } from "./dates";
import type { Appointment, CompletedAppointment, ConsultationOutcome, DemoData, Doctor, Patient } from "./types";

export const DEMO_PATIENT_ID = "p-laura";

const DOCTORS: Doctor[] = [
  { id: "d-ruiz", name: "Dr. Elena Ruiz", specialty: "General Practice" },
  { id: "d-soler", name: "Dr. Marc Soler", specialty: "Dermatology" },
  { id: "d-puig", name: "Dr. Clara Puig", specialty: "Cardiology" },
];

const PATIENTS: Patient[] = [
  { id: DEMO_PATIENT_ID, name: "Laura Martín", dateOfBirth: "1988-04-12" },
  { id: "p-jordi", name: "Jordi Vidal", dateOfBirth: "1975-09-03" },
  { id: "p-marta", name: "Marta Ferrer", dateOfBirth: "1992-01-27" },
  { id: "p-pere", name: "Pere Roca", dateOfBirth: "1960-06-15" },
  { id: "p-nuria", name: "Núria Serra", dateOfBirth: "2001-11-08" },
  { id: "p-alex", name: "Àlex Navarro", dateOfBirth: "1983-03-19" },
];

// When an appointment falls, relative to the day the demo is first opened.
type When = { kind: "today" } | { kind: "ahead"; weekdays: number } | { kind: "ago"; weekdays: number };

type SeedEntry = {
  doctorId: string;
  patientId: string;
  when: When;
  time: string;
  reason: string;
  outcome?: Omit<ConsultationOutcome, "completedAt">;
};

const today: When = { kind: "today" };
const ahead = (weekdays: number): When => ({ kind: "ahead", weekdays });
const ago = (weekdays: number): When => ({ kind: "ago", weekdays });

// "ahead" stays within 4 weekdays so every booking lands inside the bookable window.
// "ago" stays within 20 weekdays, i.e. the past 30 days.
const ENTRIES: SeedEntry[] = [
  // Dr. Elena Ruiz — General Practice
  { doctorId: "d-ruiz", patientId: "p-jordi", when: today, time: "09:30", reason: "Persistent cough" },
  { doctorId: "d-ruiz", patientId: "p-nuria", when: today, time: "11:00", reason: "Annual check-up" },
  { doctorId: "d-ruiz", patientId: "p-alex", when: today, time: "16:00", reason: "Lower back pain" },
  { doctorId: "d-ruiz", patientId: "p-marta", when: ahead(1), time: "10:00", reason: "Ongoing fatigue" },
  { doctorId: "d-ruiz", patientId: "p-pere", when: ahead(2), time: "15:30", reason: "Blood pressure review" },
  { doctorId: "d-ruiz", patientId: "p-jordi", when: ahead(3), time: "09:00", reason: "Cough follow-up" },
  { doctorId: "d-ruiz", patientId: "p-alex", when: ahead(4), time: "12:00", reason: "Flu vaccination" },
  {
    doctorId: "d-ruiz", patientId: DEMO_PATIENT_ID, when: ago(4), time: "10:30", reason: "Sore throat and fever",
    outcome: {
      diagnosis: "Acute streptococcal pharyngitis",
      prescription: { medication: "Amoxicillin 500 mg", dosage: "1 capsule every 8 hours", duration: "10 days" },
    },
  },
  {
    doctorId: "d-ruiz", patientId: "p-pere", when: ago(9), time: "09:00", reason: "Dizziness",
    outcome: { diagnosis: "Mild dehydration; advised to increase fluid intake" },
  },
  {
    doctorId: "d-ruiz", patientId: "p-marta", when: ago(14), time: "16:30", reason: "Frequent headaches",
    outcome: {
      diagnosis: "Tension-type headache",
      prescription: { medication: "Ibuprofen 400 mg", dosage: "1 tablet every 8 hours with food", duration: "5 days" },
    },
  },
  {
    doctorId: "d-ruiz", patientId: "p-nuria", when: ago(20), time: "11:30", reason: "Stomach ache",
    outcome: {
      diagnosis: "Viral gastroenteritis",
      prescription: { medication: "Oral rehydration salts", dosage: "1 sachet after each loose stool", duration: "3 days" },
    },
  },

  // Dr. Marc Soler — Dermatology
  { doctorId: "d-soler", patientId: "p-marta", when: today, time: "10:00", reason: "Mole check" },
  { doctorId: "d-soler", patientId: "p-pere", when: today, time: "15:00", reason: "Itchy rash" },
  { doctorId: "d-soler", patientId: "p-nuria", when: ahead(1), time: "09:30", reason: "Acne follow-up" },
  { doctorId: "d-soler", patientId: "p-alex", when: ahead(2), time: "11:00", reason: "Skin lesion on arm" },
  { doctorId: "d-soler", patientId: "p-jordi", when: ahead(4), time: "16:30", reason: "Eczema flare-up" },
  {
    doctorId: "d-soler", patientId: "p-nuria", when: ago(3), time: "12:00", reason: "Acne",
    outcome: {
      diagnosis: "Moderate acne vulgaris",
      prescription: { medication: "Adapalene 0.1% gel", dosage: "Apply thinly once daily at night", duration: "12 weeks" },
    },
  },
  {
    doctorId: "d-soler", patientId: "p-jordi", when: ago(8), time: "15:30", reason: "Dry, itchy patches",
    outcome: {
      diagnosis: "Atopic dermatitis",
      prescription: { medication: "Hydrocortisone 1% cream", dosage: "Apply twice daily to affected areas", duration: "7 days" },
    },
  },
  {
    doctorId: "d-soler", patientId: "p-alex", when: ago(16), time: "10:00", reason: "Scaly patch on scalp",
    outcome: {
      diagnosis: "Seborrhoeic dermatitis",
      prescription: { medication: "Ketoconazole 2% shampoo", dosage: "Use twice a week", duration: "4 weeks" },
    },
  },

  // Dr. Clara Puig — Cardiology
  { doctorId: "d-puig", patientId: "p-pere", when: today, time: "09:00", reason: "Chest tightness" },
  { doctorId: "d-puig", patientId: "p-jordi", when: today, time: "12:00", reason: "ECG results" },
  { doctorId: "d-puig", patientId: "p-alex", when: today, time: "17:00", reason: "Palpitations" },
  { doctorId: "d-puig", patientId: "p-marta", when: ahead(1), time: "15:00", reason: "Heart murmur check" },
  { doctorId: "d-puig", patientId: "p-pere", when: ahead(3), time: "10:30", reason: "Medication review" },
  { doctorId: "d-puig", patientId: "p-nuria", when: ahead(4), time: "09:30", reason: "Pre-sport screening" },
  {
    doctorId: "d-puig", patientId: DEMO_PATIENT_ID, when: ago(6), time: "11:00", reason: "Occasional palpitations",
    outcome: { diagnosis: "Benign premature atrial contractions; no treatment needed" },
  },
  {
    doctorId: "d-puig", patientId: "p-pere", when: ago(11), time: "09:30", reason: "High blood pressure",
    outcome: {
      diagnosis: "Stage 1 hypertension",
      prescription: { medication: "Enalapril 10 mg", dosage: "1 tablet once daily", duration: "3 months" },
    },
  },
  {
    doctorId: "d-puig", patientId: "p-jordi", when: ago(15), time: "16:00", reason: "Shortness of breath on exertion",
    outcome: {
      diagnosis: "Stable angina",
      prescription: { medication: "Atorvastatin 20 mg", dosage: "1 tablet at night", duration: "6 months" },
    },
  },
  {
    doctorId: "d-puig", patientId: "p-alex", when: ago(19), time: "15:00", reason: "Chest pain after exercise",
    outcome: { diagnosis: "Musculoskeletal chest wall pain" },
  },
];

function resolveDate(when: When, now: Date): Date | null {
  switch (when.kind) {
    case "today":
      return isWeekday(now) ? now : null;
    case "ahead":
      return nthWeekday(now, when.weekdays);
    case "ago":
      return nthWeekday(now, -when.weekdays);
    default: {
      const _exhaustive: never = when;
      return _exhaustive;
    }
  }
}

function toAppointment(entry: SeedEntry, day: Date, index: number): Appointment {
  const date = toLocalDate(day);
  const base = {
    id: `a-seed-${index + 1}`,
    patientId: entry.patientId,
    doctorId: entry.doctorId,
    date,
    time: entry.time,
    reason: entry.reason,
    createdAt: `${toLocalDate(nthWeekday(day, -5))}T10:00`,
  };
  if (entry.outcome === undefined) return { ...base, status: "booked" };
  return { ...base, status: "completed", outcome: { ...entry.outcome, completedAt: `${date}T${entry.time}` } };
}

export function createSeedData(now: Date): DemoData {
  const appointments = ENTRIES.flatMap((entry, index) => {
    const day = resolveDate(entry.when, now);
    return day === null ? [] : [toAppointment(entry, day, index)];
  });
  return { doctors: DOCTORS, patients: PATIENTS, appointments, seededAt: toLocalDateTime(now) };
}

// Seed timestamps all fall on earlier days, while anything made in the app is
// stamped at or after seededAt. Both are minute-precision, so ">=" keeps a
// booking made in the same minute as seeding counted as new.

/** Booked by a patient in this browser, not part of the sample data. */
export function isNewBooking(appointment: Appointment, seededAt: string): boolean {
  return appointment.createdAt >= seededAt;
}

/** Completed by a doctor in this browser, not part of the sample data. */
export function isNewOutcome(appointment: CompletedAppointment, seededAt: string): boolean {
  return appointment.outcome.completedAt >= seededAt;
}
