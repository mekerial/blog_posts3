import dotenv from "dotenv";
import {UserRepository} from "../../repositories/user-repository";
import {inputValidation} from "../input-model-validation/input-validation";
import {body} from "express-validator"

dotenv.config()

export const emailValidation = body('email').isString().trim().custom(async (email) => {
    const user = await UserRepository.findUserByLoginOrEmail(email)

    if (user) {
        throw Error("email is already used!")
    }
    return true
}).withMessage('email is already used!')
export const loginValidation = body('login').isString().trim().custom(async (login) => {
    const user = await UserRepository.findUserByLoginOrEmail(login)

    if (user) {
        throw Error("login is already used!")
    }
    return true
}).withMessage('login is already used!')

export const registrationMiddleWare = () => [emailValidation, loginValidation, inputValidation]