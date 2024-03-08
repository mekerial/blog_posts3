import {body} from "express-validator";
import {UserRepository} from "../../repositories/user-repository";
import {inputValidation} from "../input-model-validation/input-validation";

export const isConfirmedValidation = body('code').isString().trim().custom(async (code) => {
    const user = await UserRepository.getUserByVerifyCode(code)
    if (!user) {
        throw Error("not found!")
    }

    if (user.emailConfirmation.isConfirmed) {
        throw Error("email is already confirm!")
    }
    return true
}).withMessage('email is already confirm!')

export const emailConfirmationMiddleWare = () => [isConfirmedValidation, inputValidation]