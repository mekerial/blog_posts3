import {body} from "express-validator";
import {UserRepository} from "../../repositories/user-repository";
import {inputValidation} from "../input-model-validation/input-validation";

export const isConfirmedByEmailValidation = body('email').isString().trim().custom(async (email) => {
    const user = await UserRepository.findUserByLoginOrEmail(email)
    if (!user) {
        throw Error("not found!")
    }

    if (user.emailConfirmation.isConfirmed) {
        throw Error("email is already confirm!")
    }
    return true
}).withMessage('email is already confirm!')

export const emailConfirmationByEmailMiddleWare = () => [isConfirmedByEmailValidation, inputValidation]