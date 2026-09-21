import { ApiError } from './errors';

export function ok<T>(data: T, init: ResponseInit = {}) {
  return Response.json({ success: true, data }, { status: init.status ?? 200, headers: init.headers });
}

export function fail(error: ApiError | Error, status?: number) {
  const isApi = error instanceof ApiError;
  const payload = isApi
    ? { code: error.code, message: error.message }
    : { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' };
  const httpStatus = status ?? (isApi ? error.status : 500);
  return Response.json({ success: false, error: payload }, { status: httpStatus });
}
