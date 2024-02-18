import {UserDbType} from "../models/db/db-types";
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
import {ObjectId, WithId} from "mongodb";
dotenv.config()
export const jwtService = {
    async createJWT(user: WithId<UserDbType>) {
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET!, {expiresIn: '3h'})
        return token
    },
    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, process.env.JWT_SECRET!)
            return new ObjectId(result.userId)
        } catch {
            return null
        }
    }
}