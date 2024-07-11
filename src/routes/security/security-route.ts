import {Router, Request, Response} from "express";
import {jwtService} from "../../application/jwt-service";
import {SessionsRepository} from "../../repositories/security-devices-repository";
import {SecurityService} from "../../services/security-service";
import {RequestWithParams} from "../../common";

export const securityRoute = Router({})

securityRoute.get('/devices', async (req: Request, res: Response) => {
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
securityRoute.delete('/devices', async (req: Request, res: Response) => {
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

    await SecurityService.deleteSessions(refreshToken)
    res.sendStatus(204)
    return
})

securityRoute.delete('/devices/:id', async (req: RequestWithParams<string>, res: Response) => {

    const deviceId = req.params.id

    const deviceInDB = await SessionsRepository.getSessionByDeviceId(deviceId)
    if (!deviceInDB) {
        res.sendStatus(404)
        return
    }

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

    if (String(userId) !== String(deviceInDB.userId)) {
        res.sendStatus(403);
        return;
    }


    const sessionIsDeleted = await SecurityService.deleteSession(userId, deviceId)
    if (!sessionIsDeleted) {
        res.sendStatus(404)
        return
    }

    res.sendStatus(204)
    return
})