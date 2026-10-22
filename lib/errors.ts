export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'EVENT_NOT_FOUND'
  | 'EVENT_NOT_PUBLISHED'
  | 'EVENT_SALES_CLOSED'
  | 'TICKET_TYPE_NOT_FOUND'
  | 'TICKET_SOLD_OUT'
  | 'ORDER_NOT_FOUND'
  | 'ORDER_ALREADY_PAID'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_VERIFICATION_FAILED'
  | 'INVALID_WEBHOOK_SIGNATURE'
  | 'INVALID_TICKET'
  | 'TICKET_ALREADY_CHECKED_IN'
  | 'ENQUIRY_FAILED'
  | 'COUPON_INVALID'
  | 'RATE_LIMITED'
  | 'STORAGE_NOT_CONFIGURED'
  | 'FILE_TOO_LARGE'
  | 'CAPACITY_ERROR';

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: unknown;
  constructor(code: ApiErrorCode, message: string, status = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
