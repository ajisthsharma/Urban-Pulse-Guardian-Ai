# UrbanPulse Guardian AI — Project Context

## What this project is

UrbanPulse Guardian AI is a city-management web application for reporting, detecting, prioritising, and resolving urban infrastructure hazards. Its main use case is pothole detection, but it also supports garbage overflow, streetlight faults, waterlogging, obstructions, and similar civic issues.

The intended end-to-end workflow is:

1. A citizen reports an issue manually, or a road scanner detects a road hazard from a camera/video frame.
2. The system records evidence, location coordinates, severity, category, status, and reporter/source details.
3. The report is persisted to Firebase/Firestore and shown to municipal and admin users.
4. Municipal users triage, assign, update, and resolve the issue.
5. Maps, heatmaps, analytics, dispatch views, and road-risk intelligence update from the report data.

## Technology

- Frontend: React 19, TypeScript, Vite, Tailwind CSS.
- Backend: Node.js, Express (`server.ts`).
- AI vision: Google Gemini through `@google/genai`, called only from the backend.
- Database, authentication, storage: Firebase Authentication, Cloud Firestore, Firebase Storage.
- Mapping: Leaflet with CARTO fallback tiles and optional Mapbox tiles.
- Production layout: Vercel serves the frontend; Render serves the Express backend/API.

Important entry points:

| Area | File |
| --- | --- |
| Main application and role-specific navigation | `src/App.tsx` |
| Express API, Gemini scanner endpoint, reports API | `server.ts` |
| Road camera/video scanner | `src/components/RoadScanner.tsx` |
| Generic operations map/heatmap | `src/components/SimpleMap.tsx` |
| Geospatial road-risk intelligence | `src/components/RoadRiskIntelligenceView.tsx` |
| Admin governance console | `src/components/AdminPanel.tsx` |
| Firebase client configuration | `src/lib/firebase.ts` |
| API routing helper | `src/utils/apiConfig.ts` |
| Vercel-to-Render routing | `vercel.json` |

## User roles and boundaries

### Citizen

- Can report hazards, use the AI road scanner, see personal report status, use emergency/SOS flows, and track submissions.
- Citizen map cards were intentionally removed from `src/App.tsx`.
- Citizens must not see municipal/admin map and heatmap operational views.

### Municipal

- Can access incident triage, dispatch management, road-risk intelligence, city analytics, command centre, and Map & Heatmap.
- The municipal map includes a responsive report-status filter: All, Active, Pending, In Progress, and Resolved.

### Admin

- Has governance, user/team management, system/audit settings, plus municipal oversight and Map & Heatmap access.

### Field team

- Uses operational assignment and repair workflows, scanner feed, incident map, navigation, and field copilot.

Role access is controlled by client-side navigation/guards and Firebase/Firestore rules. Do not weaken authentication or role enforcement while changing UI features.

## Road Scanner requirement and implementation

The scanner is designed to:

1. Accept a vehicle dashcam, phone camera, recorded video, or image.
2. Extract and send throttled frames to `POST /api/scanner/analyze-batch`.
3. Ask Gemini Vision whether the frame contains a real roadway hazard.
4. Receive hazard category, confidence, severity, and a normalized bounding box.
5. Render a real red bounding box over the detected pothole/hazard frame.
6. Read GPS through browser geolocation and attach the current coordinates to the detected frame.
7. Use temporal confirmation and a five-metre spatial deduplication rule.
8. Save evidence and automatically submit a `ROAD_SCANNER` report to `POST /api/reports` with workflow state `MUNICIPAL QUEUED`.
9. Refresh municipal/admin datasets through the `onIncidentAutoReported` callback.

Do not replace real Gemini results with fabricated detections. If AI is unavailable, show a clear unavailable/error status.

## Gemini model configuration

Gemini calls must stay server-side. Use environment variables only; never put a Gemini key in frontend code or commit one to Git.

Required Render backend variables:

```text
GEMINI_API_KEY=<valid Google AI Studio key>
GEMINI_MODEL=gemini-3.8-flash
ROAD_SCANNER_GEMINI_MODEL=gemini-3.8-flash
```

`server.ts` now normalizes retired Gemini 1.x and 2.x model names to `gemini-3.8-flash` and only uses the current model for road scanning.

### Current production issue

At the time this document was written, GitHub `main` contains the model fix, but the Render service at `https://urban-pulse-guardian-ai.onrender.com` was still running an older build that calls `gemini-2.5-flash`. This produces a Gemini 404 error in the deployed scanner.

To apply the already-committed fix, redeploy the Render service from the latest `main` commit and set the variables above. Verify by calling:

```text
GET https://urban-pulse-guardian-ai.onrender.com/api/health
```

The response should include:

```json
"roadScannerModel": "gemini-3.8-flash"
```

## Data model expectations

Reports should retain, where available:

- ID, title, description, category, severity, priority, risk level, confidence.
- Lifecycle status: Pending, Assigned, In Progress, Resolved.
- Human-readable area/location plus latitude and longitude.
- Image/evidence frames and scanner bounding box.
- Scanner source, source camera, observation count, dimensions, and automatic-report flag.
- Reporter email, created date, assignment/dispatch information, and municipal workflow state.

Firestore is the canonical shared report store. UI changes made by municipal/admin users should update the report records so other dashboards reflect the new state.

## Maps and heatmaps

- `SimpleMap.tsx` displays report markers and risk overlays driven by report data.
- It includes the report-status filter for active, pending, in-progress, and resolved threats.
- Map/heatmap tools belong to municipal/admin operational workflows, not citizens.
- `RoadRiskIntelligenceView.tsx` renders geospatial zones classified as low, moderate, or critical based on clustered reports.
- Mapbox is optional. Configure `VITE_MAPBOX_ACCESS_TOKEN` only in local/hosting environment variables; it is a public map token but must not be committed.
- CARTO tiles are used as the fallback if no Mapbox token is configured.

## Authentication

- Firebase Auth handles sign-in.
- Do not alter the existing sign-in/authentication code unless specifically requested.
- Email/password sign-in must be enabled in Firebase Console if that sign-in method is expected. Google sign-in needs its own Firebase provider configuration.

## Local development

```bash
npm install
npm run dev
```

The local Express/Vite server uses `server.ts`. Place secrets in a local `.env` file only. Start from `.env.example`, replace placeholders, and keep `.env` untracked.

Validation commands:

```bash
npm run typecheck
npm run build
```

## Deployment routing

- Production frontend URL: `https://urban-pulse-ai-sigma.vercel.app/`
- Production backend URL: `https://urban-pulse-guardian-ai.onrender.com`
- `src/utils/apiConfig.ts` routes deployed frontend API calls directly to Render.
- `vercel.json` also contains an API rewrite to Render.

When frontend changes are pushed to `main`, Vercel may redeploy automatically. Backend behavior only changes after Render deploys the matching `main` commit.

## Recent relevant commits

- `5b935fb` — Removed citizen map cards while keeping municipal/admin maps.
- `56d6925` — Added municipal heatmap threat-status filter.
- `a44a1ec` — Improved road-risk geospatial zone rendering.
- `e60d0be` — Initial road scanner Gemini fallback update.
- `d23df6e` — Enforced current Gemini model for road scanning and added backend health diagnostic.

## Guardrails for future work

- Never commit API keys, Firebase service secrets, or personal credentials.
- Preserve the Firebase/Firestore data flow for reports and images.
- Preserve role boundaries: citizens report/track; municipal/admin manage GIS, dispatch, and governance.
- Test with `npm run typecheck` and `npm run build` before committing.
- For backend/scanner changes, test the actual Render API after deployment, not only the Vercel frontend.
