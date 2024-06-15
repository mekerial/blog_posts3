import {SessionsRepository} from "../repositories/security-devices-repository";
import {ObjectId} from "mongodb";
import {jwtService} from "../application/jwt-service";
export class SecurityService {
    static async createSession(ip: string, deviceTitle: string, deviceId: string, userId: ObjectId, refreshToken: string) {
        await SessionsRepository.createSession(ip, deviceId, deviceTitle, userId, refreshToken)
        return
    }

    static async deleteSessions(refreshToken: string) {
        const userId = await jwtService.getUserIdByRefreshToken(refreshToken)
        return await SessionsRepository.deleteSessions(userId!, refreshToken)
    }

    static async deleteSession(userId: ObjectId, deviceId: string) {
        return await SessionsRepository.deleteSession(userId, deviceId)
    }

    static async updateSession(refreshToken: string, deviceId: string, newRefreshToken: string) {
        console.log("security service get session: ")

        const session = await SessionsRepository.getSessionByRefreshToken(refreshToken)
        console.log(session)
        return await SessionsRepository.updateSession(
            session!.ip,
            session!.issuedAt,
            session!.deviceId,
            session!.deviceName,
            session!.userId,
            refreshToken,
            newRefreshToken)
    }

    static async deleteSessionByRefreshToken(refreshToken: string) {
        return await SessionsRepository.deleteSessionByRefreshToken(refreshToken)
    }
}