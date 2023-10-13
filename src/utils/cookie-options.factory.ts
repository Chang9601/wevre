import { CookieOptions } from 'express';

export function createCookieOptions(expiration: string): CookieOptions {
  return {
    httpOnly: false,
    secure: false,
    sameSite: 'strict',
    expires: new Date(Date.now() + parseInt(expiration)),
  };
}
