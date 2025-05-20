import winston from 'winston';
export declare const logger: winston.Logger;
export declare const auditLogger: winston.Logger;
export declare const stream: {
    write: (message: string) => void;
};
