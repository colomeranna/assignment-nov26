// Dates are plain local strings ("YYYY-MM-DD", "HH:mm", "YYYY-MM-DDTHH:mm")
// so a slot means the same wall-clock time wherever the app is opened.

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
};

export type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
};

export type Prescription = {
  medication: string;
  dosage: string;
  duration: string;
};

export type ConsultationOutcome = {
  diagnosis: string;
  prescription?: Prescription;
  completedAt: string;
};

type AppointmentBase = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
  createdAt: string;
};

export type BookedAppointment = AppointmentBase & { status: "booked" };

export type CompletedAppointment = AppointmentBase & {
  status: "completed";
  outcome: ConsultationOutcome;
};

export type Appointment = BookedAppointment | CompletedAppointment;

export type DemoData = {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  /** When this copy of the demo data was generated ("YYYY-MM-DDTHH:mm"). */
  seededAt: string;
};

export type Session =
  | { role: "patient"; patientId: string }
  | { role: "doctor"; doctorId: string };
