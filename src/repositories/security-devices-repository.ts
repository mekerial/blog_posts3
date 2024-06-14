import {sessionCollection} from "../db/db";
import {ObjectId} from "mongodb";
import {sessionMapper} from "../models/sessions/mappers/mapper";

export class SessionsRepository {
    static async getSession(deviceId: string) {
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
    static async updateSession(ip: string,
                               issuedAt: string,
                               deviceId: string,
                               deviceTitle: string,
                               userId: ObjectId,
                               refreshToken: string) {
        const lastActivityDate = new Date().toISOString()
        const deviceName = deviceTitle
        await sessionCollection.updateOne({deviceId: deviceId}, {issuedAt, lastActivityDate, deviceId, ip, deviceName, userId, refreshToken})
        return
    }
    static async getSessionsByUserId(userId: ObjectId) {
        const sessions = await sessionCollection.find({userId: userId}).toArray()
        return sessions.map(sessionMapper)
    }

    static async deleteSesssions(userId: ObjectId, deviceId: string) {
        await sessionCollection.deleteMany({userId: userId, deviceId: {$ne: deviceId}})
    }
}