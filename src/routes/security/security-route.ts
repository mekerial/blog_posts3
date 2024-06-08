import {Router, Request, Response} from "express";
import {jwtService} from "../../application/jwt-service";
import {SessionsRepository} from "../../repositories/security-devices-repository";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";
import {log} from "util";
import {SecurityService} from "../../services/security-service";

export const securityRoute = Router({})

securityRoute.get('/devices', loginMiddleWare, async (req: Request, res: Response) => {
    console.log('get request | /devices')
    const refreshToken = req.cookies.refreshToken
    const userId = await jwtService.getUserIdByRefreshToken(refreshToken)
    if (!userId) {
        res.sendStatus(401)
        return
    }

    const activeSessions = await SessionsRepository.getSessionsByUserId(userId)
    res.status(200).send(activeSessions)
    return
})
securityRoute.delete('/devices', loginMiddleWare, async (req: Request, res: Response) => {
    console.log(('delete request | /devices'))

    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        res.sendStatus(401)
        return
    }
    const userId = await jwtService.getUserIdByRefreshToken(refreshToken)
    if (!userId) {
        res.sendStatus(401)
        return
    }
    const deviceId = await jwtService.getDeviceIdByRefreshToken(refreshToken)

    await SecurityService.deleteSessions(userId, deviceId)
    res.sendStatus(204)
    return
})