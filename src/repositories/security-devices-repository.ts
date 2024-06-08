import {sessionCollection} from "../db/db";
import {ObjectId} from "mongodb";

export class SessionsRepository {
    static async getSession(deviceId: string) {
        return await sessionCollection.findOne({deviceId: deviceId})
    }
    static async createSession(IP: string,
                               deviceId: string,
                               deviceTitle: string,
                               userId: ObjectId,
                               refreshToken: string) {
        const issuedAt = new Date().toISOString()
        const deviceName = deviceTitle
        await sessionCollection.insertOne({issuedAt, deviceId, IP, deviceName, userId, refreshToken})
        return
    }
    static async updateSession(IP: string,
                               deviceId: string,
                               deviceTitle: string,
                               userId: ObjectId,
                               refreshToken: string) {
        const issuedAt = new Date().toISOString()
        const deviceName = deviceTitle
        await sessionCollection.updateOne({deviceId: deviceId}, {issuedAt, deviceId, IP, deviceName, userId, refreshToken})
        return
    }
    static async getSessionsByUserId(userId: ObjectId) {
        return await sessionCollection.find({userId: userId}).toArray()
    }

    static async deleteSesssions(userId: ObjectId, deviceId: string) {
        await sessionCollection.deleteMany({userId: userId, deviceId: {$ne: deviceId}})
    }
}