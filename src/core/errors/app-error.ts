export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') { super(message, 400, 'VALIDATION_ERROR'); }
}
export class AuthError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401, 'AUTH_ERROR'); }
}
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403, 'FORBIDDEN_ERROR'); }
}
export class NotFoundError extends AppError {
  constructor(message = 'Not found') { super(message, 404, 'NOT_FOUND_ERROR'); }
}
export class ConflictError extends AppError {
  constructor(message = 'Conflict') { super(message, 409, 'CONFLICT_ERROR'); }
}
