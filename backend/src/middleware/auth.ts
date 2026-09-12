import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthedRequest extends Request {
  userId?: number
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' })
  }

  const token = header.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number }
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function signToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}
