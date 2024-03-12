import {refreshTokenDbType} from "../models/db/db-types";
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
import {ObjectId} from "mongodb";
import {refreshTokenCollection} from "../db/db";
dotenv.config()
export const jwtService = {
    async createJWT(userId: ObjectId) {
        const accessToken = jwt.sign({userId: userId}, process.env.JWT_SECRET!, {expiresIn: '10000'})
        return accessToken
    },

    async getUserIdByAccessToken(accessToken: string) {
        try {
            const result: any = jwt.verify(accessToken, process.env.JWT_SECRET!)
            return new ObjectId(result.userId)
        } catch {
            return null
        }
    },

    async createRefreshToken(userId: ObjectId) {
        const refreshTokenWithId = {
            userId: userId,
            refreshToken: jwt.sign({userId: userId}, process.env.REFRESH_SECRET!, {expiresIn: '20000'})
        }

        await refreshTokenCollection.insertOne(refreshTokenWithId)
        return refreshTokenWithId.refreshToken
    },

    async getUserIdByRefreshToken(refreshToken: string) {
        try {
            const result: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!)

            if (refreshTokenCollection.find({refreshToken: refreshToken})) {
                return new ObjectId(result.userId)
            } else {
                return null
            }

        } catch {
            return null
        }
    },

    async updateAccessTokenByRefreshToken(refreshToken: string) {
        const result: refreshTokenDbType | null = await refreshTokenCollection.findOne({refreshToken: refreshToken})
        if (!result) {
            return null
        }

        const userId = await this.getUserIdByRefreshToken(refreshToken)
        if (!userId || (result.userId !== userId)) {
            return null
        }


        if (result) {
            try {
                const verifyToken: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!)
                const newAccessToken = this.createJWT(userId)
                const newRefreshToken = this.createRefreshToken(userId)

                await refreshTokenCollection.deleteOne({refreshToken: refreshToken})

                console.log('success update tokens!')

                return {
                    userId: new ObjectId(verifyToken.userId),
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                }
            } catch {
                return null
            }
        } else {
            return null
        }
    },

    async revokeRefreshToken(refreshToken: string) {
        const result = await refreshTokenCollection.findOne({refreshToken: refreshToken})
        if (!result) {
            return null
        }

        const userId = await this.getUserIdByRefreshToken(refreshToken)
        if (!userId || (result.userId !== userId)) {
            return null
        }

        if (result) {
            try {
                const verifyToken: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!)

                await refreshTokenCollection.deleteOne({refreshToken: refreshToken})

                console.log('success delete token! logout')

                return verifyToken
            } catch {
                return null
            }
        } else {
            return null
        }
    }
}