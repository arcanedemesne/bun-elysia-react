type ResponseErrorProps = {
  status: number;
  statusText: string;
  message?: string;
  validation?: string;
};

export class ResponseError extends Error {
  public status: number;
  public statusText: string;
  public message: string;
  public validation?: string;
  public name: string;

  private constructor({
    status,
    statusText,
    message,
    validation,
  }: ResponseErrorProps) {
    super(message);

    this.status = status;
    this.statusText = statusText;
    this.message = message ?? "";
    this.validation = validation;
    this.name = "ResponseError";
  }

  public static throw = (props: ResponseErrorProps) => {
    throw new ResponseError(props).stringify();
  };

  private stringify = () => {
    return JSON.stringify(this);
  };
}
