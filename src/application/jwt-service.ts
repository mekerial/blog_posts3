import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
import {ObjectId} from "mongodb";
import {refreshTokenModel} from "../db/db";
import {SessionsRepository} from "../repositories/security-devices-repository";
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

    async createRefreshToken(userId: ObjectId, deviceId: string) {
        const refreshTokenWithId = {
            userId: userId,
            refreshToken: jwt.sign({userId: userId, deviceId: deviceId}, process.env.REFRESH_SECRET!, {expiresIn: '20000'})
        }

        await refreshTokenModel.insertMany([refreshTokenWithId])
        return refreshTokenWithId.refreshToken
    },

    async getUserIdByRefreshToken(refreshToken: string) {
        try {

            const result: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!)
            const getRefreshToken = await refreshTokenModel.find({refreshToken: refreshToken}).lean()

            if (getRefreshToken[0]) {
                return new ObjectId(result.userId)
            } else {
                return null
            }

        } catch {
            return null
        }
    },

    async getDeviceIdByRefreshToken(refreshToken: string) {
        try {
            const result: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!)
            const getRefreshToken = await refreshTokenModel.find({refreshToken: refreshToken}).lean()

            if (getRefreshToken[0]) {
                return result.deviceId
            } else {
                return null
            }

        } catch {
            return null
        }
    },

    async updateAccessTokenByRefreshToken(refreshToken: string, deviceId: string) {
        const result = await refreshTokenModel.find({refreshToken: refreshToken}).lean()
        if (!result[0]) {
            return null
        }

        const userId = await jwtService.getUserIdByRefreshToken(refreshToken)
        if (!userId || !(result[0].userId !== userId)) {
            console.log('1 unsuccess update tokens!')
            return null
        }


        if (result) {
            try {
                const verifyToken: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!)
                const newAccessToken = await jwtService.createJWT(userId)
                const newRefreshToken = await jwtService.createRefreshToken(userId, deviceId)

                await refreshTokenModel.deleteOne({refreshToken: refreshToken})

                const session = await SessionsRepository.getSessionByRefreshToken(refreshToken)
                console.log("updating session in jwt")
                await SessionsRepository.updateSession(
                    session!.ip,
                    session!.issuedAt,
                    session!.deviceId,
                    session!.deviceName,
                    session!.userId,
                    refreshToken,
                    newRefreshToken
                )

                console.log('success update tokens!')

                return {
                    userId: new ObjectId(verifyToken.userId),
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                }
            } catch {
                console.log('2 unsuccess update tokens!')
                return null
            }
        } else {
            console.log('3 unsuccess update tokens!')
            return null
        }
    },

    async revokeRefreshToken(refreshToken: string) {
        const result = await refreshTokenModel.find({refreshToken: refreshToken}).lean()
        if (!result[0]) {
            return null
        }

        const userId = await jwtService.getUserIdByRefreshToken(refreshToken)
        if (!userId || !(result[0].userId !== userId)) {
            return null
        }

        if (result) {
            try {
                const verifyToken: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!)

                await refreshTokenModel.deleteOne({refreshToken: refreshToken})

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