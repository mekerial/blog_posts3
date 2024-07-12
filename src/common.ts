import {Request} from "express";

export type RequestWithParams<P> = Request<{ id: string }, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithBodyAndParams<P,B> = Request<P, {}, B, {}>
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>
export type RequestWithBodyAndQuery<B, Q> = Request<{}, {}, B, Q>
export type Params = { id: string }
export type ErrorType = {
    errorsMessages: ErrorMessageType[]
}
export type ErrorMessageType = {
    field: string
    message: string
}
