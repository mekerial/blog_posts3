import {NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import {jwtService} from "../../application/jwt-service";
import {UserRepository} from "../../repositories/user-repository";

dotenv.config()

export const loginMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(401)
        return
    }

    const token = req.headers.authorization.split(' ')[1]

    const userId = await jwtService.getUserIdByToken(token)
    if(!userId) {
        res.sendStatus(401)
        return
    }

    req.user = await UserRepository.getUserById(userId)
    console.log('success jwt check')
    next()
}