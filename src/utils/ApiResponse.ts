export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;
  public readonly meta?: Record<string, unknown>;

  constructor(statusCode: number, message: string = 'Success', data?: T, meta?: Record<string, unknown>) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static success<T>(data?: T, message: string = 'Success', statusCode: number = 200, meta?: Record<string, unknown>): ApiResponse<T> {
    return new ApiResponse<T>(statusCode, message, data, meta);
  }

  static created<T>(data?: T, message: string = 'Created successfully'): ApiResponse<T> {
    return new ApiResponse<T>(201, message, data);
  }
}
