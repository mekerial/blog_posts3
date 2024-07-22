import {body} from 'express-validator'
import {inputValidation} from "../middlewares/input-model-validation/input-validation";

export const likeStatusValidate = body('content').isString().trim().isIn([ "None", "Like", "Dislike" ]).withMessage('Incorrect content!')

export const likeStatusValidation = () => [likeStatusValidate, inputValidation]