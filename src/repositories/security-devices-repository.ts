import {sessionModel} from "../db/db";
import {ObjectId} from "mongodb";
import {transformSessionDB} from "../models/sessions/mappers/mapper";
import {sessionDbType} from "../models/db/db-types";

export class SessionsRepository {
    static async getSessionByDeviceId(deviceId: string) {
        return await sessionModel.findOne({deviceId: deviceId})
    }
    static async createSession(ip: string,
                               deviceId: string,
                               deviceTitle: string,
                               userId: ObjectId,
                               refreshToken: string) {
        const issuedAt = new Date().toISOString()
        const deviceName = deviceTitle
        const lastActivityDate = issuedAt
        await sessionModel.insertMany([{issuedAt, lastActivityDate, deviceId, ip, deviceName, userId, refreshToken}])
        return
    }
    static async getSessionByRefreshToken(refreshToken: string): Promise<sessionDbType | null> {
        const result = await sessionModel.findOne({refreshToken: refreshToken});
        if (!result) {
            return null
        }
        return result.toObject()
    }
    static async updateSession(ip: string,
                               issuedAt: string,
                               deviceId: string,
                               deviceTitle: string,
                               userId: ObjectId,
                               refreshToken: string,
                               newRefreshToken: string) {
        console.log('updating session')
        const lastActivityDate = new Date().toISOString()
        const deviceName = deviceTitle
        const sessionId = await sessionModel.findOne({refreshToken: refreshToken})

        if (!sessionId) {
            console.log("not found session")
            return
        }

        console.log("updating session5")
        const result = await sessionModel.updateOne(
            { refreshToken: refreshToken },
            {
                $set: {
                    issuedAt,
                    lastActivityDate,
                    deviceId,
                    ip,
                    deviceName,
                    userId,
                    refreshToken: newRefreshToken
                }
            }
        );
        console.log("success update session")
        return
    }

    static async getSessionsByUserId(userId: ObjectId) {
        const sessions = await sessionModel.find({userId: userId}).lean()
        return sessions.map(transformSessionDB)
    }

    static async deleteSessions(userId: ObjectId, refreshToken: string) {
        await sessionModel.deleteMany({userId: userId, refreshToken: {$ne: refreshToken}})
    }

    static async deleteSession(userId: ObjectId, deviceId: string) {
        const isDel = await sessionModel.deleteOne({userId: userId, deviceId: deviceId})
        return isDel.deletedCount!!
    }

    static async deleteSessionByRefreshToken(refreshToken: string) {
        const result = await sessionModel.deleteOne({refreshToken: refreshToken})
        return result.deletedCount!!
    }
}