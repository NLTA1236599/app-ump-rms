import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

function clientIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

const tooMany = {
  error: {
    code: 'TOO_MANY_ATTEMPTS',
    message: 'Bạn thử quá nhiều lần. Vui lòng thử lại sau.',
  },
};

/** General API ceiling — room for normal browsing/editing. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});

/** Login: count failures only, keyed by IP + identifier. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const id = String(req.body?.username ?? req.body?.email ?? '').trim().toLowerCase();
    return `${clientIp(req)}|${id}`;
  },
  message: {
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Bạn thử quá nhiều lần. Vui lòng thử lại sau 15 phút.',
    },
  },
});

/** verify-otp / resend-otp. */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const id = String(req.body?.email ?? '').trim().toLowerCase();
    return `${clientIp(req)}|${id}`;
  },
  message: {
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Bạn thử quá nhiều lần. Vui lòng thử lại sau 10 phút.',
    },
  },
});
