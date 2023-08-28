import { CookieOptions } from 'express';
import { Schema as MongooseSchema } from 'mongoose';

export const createCookieOptions = (expiration: string): CookieOptions => {
  return {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    expires: new Date(Date.now() + parseInt(expiration)),
  };
};

export const createCacheKey = (obj: string, id: string) => {
  return `${obj}#${id}`;
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return { year, month, day };
};

export const buildFilter = (
  key: string,
  value: string | number | MongooseSchema.Types.ObjectId,
) => {
  const filter = {};

  filter[key] = value;

  return filter;
};
