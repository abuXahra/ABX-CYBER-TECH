export class AuthorizationError extends Error {
  constructor(message = "Administrator authentication required") {
    super(message);
    this.name = "AuthorizationError";
  }
}
export class PublishValidationError extends Error {
  constructor(public issues: { path?: string; message: string }[]) {
    super("Content failed validation and cannot be saved or published");
    this.name = "PublishValidationError";
  }
}
export class PublishConflictError extends Error {
  constructor() {
    super("Another publish happened at the same time. Reload and try again.");
    this.name = "PublishConflictError";
  }
}
export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}

/** No published revision exists for this target yet (distinct from a database failure). */
export class NotPublishedError extends Error {
  constructor(what: string) {
    super(`${what} has no published revision`);
    this.name = "NotPublishedError";
  }
}
/** The database could not be reached or returned unusable data. Never treated as "empty content". */
export class ContentUnavailableError extends Error {
  constructor(what: string, options?: { cause?: unknown }) {
    super(`Could not load ${what}`, options);
    this.name = "ContentUnavailableError";
  }
}
