import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: "your-service-name" },
    transports: [
        //
        // - Write to all logs with level `info` and below to `quick-start-combined.log`.
        // - Write all logs error (and below) to `quick-start-error.log`.
        //
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
    ],
});

if (typeof window === "undefined") {
    logger.add(new transports.File({ filename: "error.log", level: "error" }));
    logger.add(new transports.File({ filename: "combined.log" }));
}

// development環境の場合、より詳細なログを出力
// if (process.env.NODE_ENV !== "production") {
//     logger.add(
//         new transports.Console({
//             format: format.combine(format.colorize(), format.simple()),
//         })
//     );
// }

export default logger;
