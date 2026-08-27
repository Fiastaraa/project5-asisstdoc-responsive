# AssistDoc Mobile — Complete Client Migration

This project is a React Native / Expo migration of the existing AssistDoc `client` application. The existing Express + Prisma + PostgreSQL `server` remains the single backend.

## Target

- Expo SDK 57
- Expo 57.0.16 patch line
- React Native 0.86.2
- React 19.2.3
- Expo Router 57.0.16
- TypeScript 6.0.x

## What is included

All web-client role areas are represented in the mobile workspace:

### Admin
- Dashboard
- Patients
- Registration
- Queue
- Invoices & Payments
- Reports
- User Management
- Settings

### Doctor
- Dashboard
- Patient Queue
- Patient Info
- Consultation
- Diagnosis
- Prescriptions
- Medical Notes
- Schedule

### Nurse
- Dashboard
- Patient Queue
- Patient Search
- Patient Info & Vitals
- Initial Assessment
- Record Vitals
- Notes & Tasks
- Schedule

### Pharmacist
- Dashboard
- Prescription Queue
- Medicine Inventory
- Prescription Detail
- Stock Management
- Notifications
- Reports & Analytics
- Schedule

### Patient
- Dashboard
- My Queue
- Visit History
- Invoices
- Schedule

The mobile screens use the same API routes as the existing client, rather than creating a second backend.

## Install

```powershell
cd mobile
npm install --legacy-peer-deps
npx expo install --check
npm run typecheck
```

## API configuration

For the current development laptop IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.9:3000/api
```

If the PC IP changes, run:

```powershell
ipconfig
```

and update `mobile/.env`.

For Android emulator use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

## Backend for a physical phone

Apply `server_mobile_patch/server.ts` to the existing server. It changes Express from localhost-only binding to `0.0.0.0`.

Start backend:

```powershell
cd server
npm run dev
```

Start mobile:

```powershell
cd mobile
npx expo start -c
```

Phone and PC must be on the same Wi-Fi.

## First test

Open the mobile Login screen and tap **Test server connection**.

The expected result is:

```text
Server terhubung
API: ok
Database: connected
```

Only after this succeeds should you test login.

## Demo accounts from the supplied seed

```text
admin@assistdoc.com       Admin12345
 doctor@assistdoc.com     Admin12345
nurse@assistdoc.com       Admin12345
pharmacist@assistdoc.com  Admin12345
patient@assistdoc.com     Admin12345
```

## Functional flow

```text
Admin Registration
      ↓
Patient + Visit
      ↓
WAITING queue
      ↓
Nurse Assessment / Vitals
      ↓
IN_CONSULTATION
      ↓
Doctor Consultation
      ↓
Diagnosis + Prescription
      ↓
Pharmacist READY
      ↓
Invoice
      ↓
Admin Payment
      ↓
PAID
```

## Important

Do not run `npm audit fix --force` while setting up the Expo project. It can move packages outside the Expo SDK 57 compatibility set.
