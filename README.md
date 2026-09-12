# Fitness Tracker

What's currently done: Auth, exercise/muscle schema, and workout logging. The 3D muscle
viewer isn't wired in yet — `Muscle.meshId` is already in the schema and
`Exercises.tsx` maps exercises to muscles via checkboxes as a stand-in for the
future 3D "map to" picker, so the mapping data itself doesn't change later.

## Backend

```bash
cd backend
npm install
cp .env.example .env       # shown for reference
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev                 # http://localhost:4000
```

Runs on SQLite by default — zero external setup. To switch to MySQL or
Postgres later, see the comment at the top of `prisma/schema.prisma`; it's a
two-line change (`provider` + `DATABASE_URL`), no model changes needed.

## Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:4000`, so run the backend first.

## What's here

- `backend/prisma/schema.prisma` — User, MuscleGroup, Muscle, Exercise,
  ExerciseMuscle (junction), Workout, WorkoutExercise, WorkoutSet
- `backend/prisma/seed.ts` — starter muscle groups/muscles + a handful of
  default exercises, all with `meshId: null` until the 3D model exists
- `backend/src/routes/` — auth, exercises (CRUD + muscle mapping), muscles
  (read-only, for populating the mapping UI), workouts (create, add exercise,
  log sets)
- `frontend/src/pages/` — Login, Register, Dashboard, Exercises (list + add
  form), WorkoutLog (start a workout, add exercises, log sets), WorkoutHistory

## Next up

Export the trimmed Blender model, wire it into
an R3F viewer component, replace the checkbox muscle-picker with clicking the
3D model, then muscle-group color settings and deploy.
