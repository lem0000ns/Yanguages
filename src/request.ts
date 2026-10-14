import { Request } from "express";

export interface IGetUserAuthInfoRequest extends Request {
  logout: (callback: (err?: unknown) => void) => void;
  user?: unknown;
  session: {
    destroy: (callback: (err?: unknown) => void) => void;
  };
}
