import {OutputUserModel} from "../models/users/output";

declare global {
    declare namespace Express {
        export interface Request {
            user: OutputUserModel | null
        }
    }
}