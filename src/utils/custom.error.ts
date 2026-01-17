export class CustomError extends Error {
  public statusCode: number
  public message: string
public error:string
  constructor(msg: string, statusCode = 500) {
    super(msg)

    this.statusCode = statusCode
    this.message = 'Application error occurred in custom error class'
    this.error=msg

    Error.captureStackTrace(this, this.constructor)
  }
}
