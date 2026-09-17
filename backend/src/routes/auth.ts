import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken } from '../middleware/auth'

const router = Router()

// Accepts either a standard email address or a loosely-validated phone number
// (digits plus common separators, 7-15 digits) — the same input field on the
// frontend is used for both.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9()\-\s]{7,20}$/

const identifierSchema = z
  .string()
  .min(1, 'Email or phone number is required')
  .refine((value) => EMAIL_RE.test(value) || PHONE_RE.test(value), {
    message: 'Enter a valid email address or phone number',
  })

const registerSchema = z.object({
  email: identifierSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
})

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }
  const { email, password, name, username } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: 'An account with that email or phone number already exists' })
  }

  if (username) {
    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return res.status(409).json({ error: 'That username is already taken' })
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, passwordHash, name, username },
  })

  const token = signToken(user.id)
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, username: user.username },
  })
})

const loginSchema = z.object({
  email: identifierSchema,
  password: z.string().min(1, 'Password is required'),
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'Invalid email/phone number or password' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email/phone number or password' })
  }

  const token = signToken(user.id)
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, username: user.username },
  })
})

export default router
