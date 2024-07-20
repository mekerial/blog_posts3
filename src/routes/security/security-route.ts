import {Router, Request, Response} from "express";
import {jwtService} from "../../application/jwt-service";
import {SessionsRepository} from "../../repositories/security-devices-repository";
import {SecurityService} from "../../services/security-service";
import {RequestWithParams} from "../../common";


class SecurityController {
    async getSessions(req: Request, res: Response) {
        console.log('get on /devices')
        const refreshToken = req.cookies.refreshToken
        const userId = await jwtService.getUserIdByRefreshToken(refreshToken)

        if (!userId) {
            res.sendStatus(401)
            return
        }

        const activeSessions = await SessionsRepository.getSessionsByUserId(userId)
        res.status(200).send(activeSessions)
        return
    }

    async deleteSessions(req: Request, res: Response) {
        console.log('delete on /devices')

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
    }

    async deleteOneSession(req: RequestWithParams<string>, res: Response) {
        console.log('delete on /devices/:id')

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
    }
}

const securityController = new SecurityController()
export const securityRoute = Router({})

securityRoute.get('/devices', securityController.getSessions)
securityRoute.delete('/devices', securityController.deleteSessions)
securityRoute.delete('/devices/:id', securityController.deleteOneSession)