type ResponseErrorProps = {
  status: number;
  statusText: string;
  message?: string;
  validation?: string;
};

export class ResponseError {
  public status: number;
  public statusText: string;
  public message?: string;
  public validation?: string;
  constructor({ status, statusText, message, validation }: ResponseErrorProps) {
    this.status = status;
    this.statusText = statusText;
    this.message = message ?? "";
    this.validation = validation;
  }
}
