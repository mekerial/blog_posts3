import {NextFunction, Request, Response} from "express";
import {ValidationError, validationResult} from "express-validator";

export const inputValidation = (req: Request, res: Response, next: NextFunction) => {
    const formattedError = validationResult(req).formatWith((error: ValidationError) => {
        switch (error.type) {
            case "field":
                return {
                    message: error.msg,
                    field: error.path
                }
            default:
                return {
                    message: error.msg,
                    field: 'Unknown'
                }
        }
    })

    if (!formattedError.isEmpty()) {
        const errorMessage = formattedError.array({onlyFirstError: true})

        const errors = {
            errorsMessages: errorMessage
        }

        res.status(400).send(errors)
        return
    }

    next()
}