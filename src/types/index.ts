// Exports:
export type SuccessReturnable<S> = { status: true, payload: S }

export type FailReturnable<F> = { status: false, payload: F }

export type Returnable<S, F> = SuccessReturnable<S> | FailReturnable<F>

export type DeepRequired<T> = Required<{
  [P in keyof T]: T[P] extends object | undefined ? DeepRequired<Required<T[P]>> : T[P];
}>

export interface APIResponse<T> {
  status: string
  message: string
  data?: T
}
