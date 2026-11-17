/** Практически без лимита (nginx client_max_body_size 0 = без ограничения тела запроса). */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;
export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));