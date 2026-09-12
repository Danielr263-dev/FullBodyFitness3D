import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/auth'
import exerciseRoutes from './routes/exercises'
import muscleRoutes from './routes/muscles'
import workoutRoutes from './routes/workouts'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/exercises', exerciseRoutes)
app.use('/api', muscleRoutes) // -> /api/muscle-groups, /api/muscles
app.use('/api', workoutRoutes) // -> /api/workouts, /api/workout-exercises/...

// Keep this last: catches anything that fell through the routes above.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
})

const PORT = process.env.PORT ?? 4000
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
