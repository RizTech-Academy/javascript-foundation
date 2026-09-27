export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function messageFor(error) {
  if (error instanceof TimeoutError) {
    return 'The rate card took too long to load.';
  }
  if (error instanceof NetworkError) {
    return 'Could not reach the server. Check your connection.';
  }
  if (error instanceof HttpError) {
    if (error.status === 404) return 'Today’s rate card is missing.';
    if (error.status >= 500) return 'The server is having trouble. Try again shortly.';
    return 'Something was wrong with that request.';
  }
  return 'Something went wrong loading the rates.';
}
