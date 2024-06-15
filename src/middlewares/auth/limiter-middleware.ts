import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 секунд
    max: 5, // максимум 5 запросов с одного IP
    message: 'Many requests, try again after 10 seconds',
    statusCode: 429, // статус ответа при превышении лимита
});

export const loginLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 секунд
    max: 4, // максимум 5 запросов с одного IP
    message: 'Many requests, try again after 10 seconds',
    statusCode: 429, // статус ответа при превышении лимита
});