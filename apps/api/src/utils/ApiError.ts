/**
 * Custom error class for expected, operational errors (bad input, not
 * found, unauthorized, etc). Thrown from controllers/services and caught
 * by the centralized error middleware, which knows how to translate an
 * ApiError into a consistent HTTP response.
 *
 * Unexpected (programmer) errors should NOT be wrapped in ApiError — let
 * them propagate so the error middleware logs them and returns a generic
 * 500 without leaking internals.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]> | null;

  constructor(
    statusCode: number,
    message: string,
    errors: Record<string, string[]> | null = null
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", errors?: Record<string, string[]>) {
    return new ApiError(400, message, errors ?? null);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}
