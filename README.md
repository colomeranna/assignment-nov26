# Clinic Portal (prototype)

A clickable prototype of a clinic portal for patients and doctors, built for a 2-hour product exercise. A patient books an appointment, the doctor sees it on their dashboard, completes the consultation with a diagnosis and prescription, and the patient sees the outcome.

**Live demo:** https://assignment-nov26.vercel.app/

## How to try it

1. Continue as Laura and book an appointment with any doctor.
2. Use the role switcher in the header to become that doctor, and find the booking in the dashboard.
3. Open the record and complete the consultation with a diagnosis and prescription.
4. Switch back to Laura to see the outcome.

Data is saved in this browser only, so each tester has their own copy.

## What's included

- Role sign-in and one-click switching between the patient and three doctors
- Booking with available, taken and past slots
- Doctor dashboard: Today / Upcoming / Completed
- Patient record with consultation history across doctors
- Consultation outcome: diagnosis and optional prescription
- Outcome visible to the patient as soon as it's saved
- Validation on booking and on the consultation form
- Reset demo data

## Simplifications

- Simulated sign-in with fixed demo users
- Data lives in `localStorage` per browser; there is no shared backend
- Seed data is generated relative to the first visit, so there are always appointments today and this week
- Doctors can complete future appointments, so the whole loop can be tested in one sitting
- Outcomes can't be edited after saving
- No cancelling, rescheduling or notifications

## Stack

Next.js (App Router), React, TypeScript and Tailwind CSS, deployed on Vercel.

```bash
npm install
npm run dev
```

Domain types, seed data, schedule rules and the storage layer are in `lib/`; pages are in `app/`.
