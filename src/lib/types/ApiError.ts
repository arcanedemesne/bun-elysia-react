import { emitAlert } from "@/components";

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
  constructor({ status, statusText, message, validation }: ApiErrorProps) {
    super(message);

    this.status = status;
    this.statusText = statusText ?? "An Error Occured";
    this.message = message ?? "Failed request, please try again later.";
    this.validation = validation;

    // only emit if a message exists, or else it is for validation
    message && emitAlert(this);
  }
}
