import {body} from 'express-validator'
import {inputValidation} from "../middlewares/input-model-validation/input-validation";

export const loginValidation = body('login').isString().isLength({min: 3, max: 10}).withMessage('Incorrect login!')
export const passwordValidation = body('password').isString().isLength({min: 6, max: 20}).withMessage('Incorrect password!')
export const emailValidation = body('email').isEmail().withMessage('Incorrect email!')
export const newPasswordValidation = body('newPassword').isString().isLength({min: 6, max: 20}).withMessage('Incorrect password!')
export const userValidation = () => [loginValidation, passwordValidation, emailValidation, inputValidation]