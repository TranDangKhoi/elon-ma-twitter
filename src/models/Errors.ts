import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { ValidationMessage } from "~/constants/messages.enum";

type TError = Record<
  string,
  {
    msg: string;
    [key: string]: any;
  }
>;

export class ErrorWithStatus {
  message: string;
  status: number;
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message;
    this.status = status;
  }
}

export class UnprocessableEntityError extends ErrorWithStatus {
  errors: TError;
  constructor({ message = ValidationMessage.VALIDATION_ERROR, errors }: { message?: string; errors: TError }) {
    super({ message, status: HttpStatusCode.UNPROCESSABLE_ENTITY });
    this.errors = errors;
  }
}

export class UnauthorizedError extends ErrorWithStatus {
  // errors: TError;
}
