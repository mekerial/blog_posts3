import {sessionModel} from "../db/db";
import {ObjectId} from "mongodb";
import {mapperSessionDB, transformSessionDB} from "../models/sessions/mappers/mapper";
import {sessionDbType} from "../models/db/db-types";
import mongoose from "mongoose";

export class SessionsRepository {
    static async getSessionByDeviceId(deviceId: string) {
        const deviceID = deviceId;

        const leanElement = await sessionModel.find({deviceId: deviceID}).lean();

        if (!leanElement[0]) {
            return null
        }
        return leanElement[0]
    }
    static async createSession(ip: string,
                               deviceId: string,
                               deviceTitle: string,
                               userId: ObjectId,
                               refreshToken: string) {
        const issuedAt = new Date().toISOString()
        const deviceName = deviceTitle
        const lastActiveDate = issuedAt
        await sessionModel.insertMany([{issuedAt, lastActiveDate, deviceId, ip, deviceName, userId, refreshToken}])
        return
    }
    static async getSessionByRefreshToken(refreshToken: string): Promise<sessionDbType | null> {
        const result = await sessionModel.find({refreshToken: refreshToken}).lean();
        if (!result[0]) {
            return null
        }
        // @ts-ignore
        return mapperSessionDB(result[0])
    }
    static async updateSession(ip: string,
                               issuedAt: string,
                               deviceId: string,
                               deviceTitle: string,
                               userId: ObjectId,
                               refreshToken: string,
                               newRefreshToken: string) {
        console.log('updating session')
        const lastActiveDate = new Date().toISOString()
        const deviceName = deviceTitle
        const sessionId = await sessionModel.find({refreshToken: refreshToken}).lean()

        if (!sessionId[0]) {
            console.log("not found session")
            return
        }

        console.log("updating session5")
        const result = await sessionModel.updateOne(
            { refreshToken: refreshToken },
            {
                $set: {
                    issuedAt,
                    lastActiveDate,
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

    static async getSessionsByUserId(id: ObjectId) {
        const userId = new mongoose.Types.ObjectId(id);
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