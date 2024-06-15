import {sessionCollection} from "../db/db";
import {ObjectId} from "mongodb";
import {sessionMapper} from "../models/sessions/mappers/mapper";

export class SessionsRepository {
    static async getSessionByDeviceId(deviceId: string) {
        return await sessionCollection.findOne({deviceId: deviceId})
    }
    static async createSession(ip: string,
                               deviceId: string,
                               deviceTitle: string,
                               userId: ObjectId,
                               refreshToken: string) {
        const issuedAt = new Date().toISOString()
        const deviceName = deviceTitle
        const lastActivityDate = issuedAt
        await sessionCollection.insertOne({issuedAt, lastActivityDate, deviceId, ip, deviceName, userId, refreshToken})
        return
    }
    static async getSessionByRefreshToken(refreshToken: string) {
        return await sessionCollection.findOne({refreshToken: refreshToken})
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
        const sessionId = await sessionCollection.findOne({refreshToken: refreshToken})

        if (!sessionId) {
            console.log("not found session")
            return
        }

        console.log("updating session5")
        const result = await sessionCollection.updateOne(
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
        const sessions = await sessionCollection.find({userId: userId}).toArray()
        return sessions.map(sessionMapper)
    }

    static async deleteSessions(userId: ObjectId, refreshToken: string) {
        await sessionCollection.deleteMany({userId: userId, refreshToken: {$ne: refreshToken}})
    }

    static async deleteSession(userId: ObjectId, deviceId: string) {
        const isDel = await sessionCollection.deleteOne({userId: userId, deviceId: deviceId})
        return isDel.deletedCount!!
    }

    static async deleteSessionByRefreshToken(refreshToken: string) {
        const result = await sessionCollection.deleteOne({refreshToken: refreshToken})
        return result.deletedCount!!
    }
}