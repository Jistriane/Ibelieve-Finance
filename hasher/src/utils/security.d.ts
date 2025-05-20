import { RequestHandler } from 'express';
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const sensitiveLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const validateToken: (token: string) => boolean;
export declare const generateToken: (payload: any) => string;
export declare const compress: RequestHandler<import("@types/express-serve-static-core").ParamsDictionary, any, any, import("@types/qs").ParsedQs, Record<string, any>>;
