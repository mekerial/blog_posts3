import {ObjectId} from "mongodb";

export type OutputUserModel = {
    id: ObjectId,
    login: string,
    email: string,
    createdAt: string
}