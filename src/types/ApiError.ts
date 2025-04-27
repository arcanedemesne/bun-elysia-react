type ApiErrorProps = {
  status: number;
  statusText: string;
  message?: string;
  validation?: string;
};

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public validation?: string;
  constructor({
    status,
    statusText,
    message,
    validation,
  }: ApiErrorProps) {
    super(message);

    this.status = status;
    this.statusText = statusText;
    this.message = message ?? '';
    this.validation = validation;
  }
}
