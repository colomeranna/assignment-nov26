# Clinic Portal (prototype)

A clickable prototype of a clinic portal for patients and doctors, built for a 2-hour product exercise. A patient books an appointment, the doctor sees it on their dashboard, completes the consultation with a diagnosis and prescription, and the patient sees the outcome.

**Live demo:** https://assignment-nov26.vercel.app/

## How to try it

Try the full journey (about 2 minutes):

1. Sign in as Laura, choose a doctor and an available time, and book.
2. Switch to that doctor with the role switcher at the top of the page. The booking is on their dashboard.
3. Open the patient record and add a diagnosis and a prescription.
4. Switch back to Laura to see the consultation outcome.

Data is saved in your browser only, so each tester has their own copy. Use Reset demo data at the top of the page to start over.

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
