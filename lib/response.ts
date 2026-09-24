import { ApiError } from "./errors";
import { env } from "./env";

export function ok<T>(data: T, init: ResponseInit = {}) {
  return Response.json(
    { success: true, data },
    { status: init.status ?? 200, headers: init.headers },
  );
}

export function fail(error: ApiError | Error, status?: number) {
  const isApi = error instanceof ApiError;
  // Log server-side for diagnostics
  // eslint-disable-next-line no-console
  console.error("[API ERROR]", error);
  const payload = isApi
    ? { code: error.code, message: error.message }
    : env.NODE_ENV !== "production"
      ? { code: "INTERNAL_ERROR", message: (error as Error).message }
      : { code: "INTERNAL_ERROR", message: "An unexpected error occurred." };
  const httpStatus = status ?? (isApi ? error.status : 500);
  return Response.json(
    { success: false, error: payload },
    { status: httpStatus },
  );
}
