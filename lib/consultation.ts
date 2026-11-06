import type { ConsultationOutcome } from "./types";

export type ConsultationForm = {
  diagnosis: string;
  medication: string;
  dosage: string;
  duration: string;
};

export type ConsultationErrors = Partial<Record<"diagnosis" | "medication" | "dosage", string>>;

export type ConsultationValidation =
  | { kind: "valid"; outcome: Omit<ConsultationOutcome, "completedAt"> }
  | { kind: "invalid"; errors: ConsultationErrors };

/** Diagnosis is required; a prescription is optional, but once started it needs medication and dosage. */
export function validateConsultation(form: ConsultationForm): ConsultationValidation {
  const diagnosis = form.diagnosis.trim();
  const medication = form.medication.trim();
  const dosage = form.dosage.trim();
  const duration = form.duration.trim();
  const hasPrescription = medication !== "" || dosage !== "" || duration !== "";

  const errors: ConsultationErrors = {};
  if (diagnosis === "") errors.diagnosis = "Enter a diagnosis.";
  if (hasPrescription && medication === "") errors.medication = "Enter the medication, or clear the prescription.";
  if (hasPrescription && dosage === "") errors.dosage = "Enter the dosage, or clear the prescription.";
  if (Object.keys(errors).length > 0) return { kind: "invalid", errors };

  return {
    kind: "valid",
    outcome: hasPrescription ? { diagnosis, prescription: { medication, dosage, duration } } : { diagnosis },
  };
}
