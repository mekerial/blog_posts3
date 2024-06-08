import {SessionsRepository} from "../repositories/security-devices-repository";
import {ObjectId} from "mongodb";
export class SecurityService {
    static async createSession(IP: string, deviceTitle: string, deviceId: string, userId: ObjectId, refreshToken: string) {
        const activeSession = await SessionsRepository.getSession(deviceId)
        if (activeSession) {
            await SessionsRepository.updateSession(IP, deviceId, deviceTitle, userId, refreshToken)
            return
        }
        await SessionsRepository.createSession(IP, deviceId, deviceTitle, userId, refreshToken)
        return
    }

    static async deleteSessions(userId: ObjectId, deviceId: string) {
        return await SessionsRepository.deleteSesssions(userId, deviceId)
    }
}