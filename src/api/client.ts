const LATENCY = { min: 300, max: 800 };

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Simulates a network request with realistic latency. */
export async function mockRequest<T>(factory: () => T): Promise<T> {
  const delay = LATENCY.min + Math.random() * (LATENCY.max - LATENCY.min);
  await new Promise<void>(r => setTimeout(r, delay));
  return factory();
}
