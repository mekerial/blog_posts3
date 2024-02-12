import {body, param} from "express-validator"
import {inputValidation} from "../middlewares/input-model-validation/input-validation";

export const titleValidation = body('title').isString().trim().isLength({min: 1, max: 30}).withMessage('Incorrect title!')
export const shortDescriptionValidation = body('shortDescription').isString().trim().isLength({min: 1, max: 100}).withMessage('Incorrect shortDescription!')
export const contentValidation = body('content').isString().trim().isLength({min: 1, max: 1000}).withMessage('Incorrect content!')


export const blogPostValidation = () => [titleValidation, shortDescriptionValidation, contentValidation, inputValidation]

