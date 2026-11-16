/** Единый лимит с nginx (client_max_body_size). */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));