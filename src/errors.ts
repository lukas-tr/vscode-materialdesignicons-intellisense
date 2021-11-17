export class VersionNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, VersionNotFoundError.prototype);
  }
}
