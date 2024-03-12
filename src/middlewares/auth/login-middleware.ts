import {NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import {jwtService} from "../../application/jwt-service";
import {UserRepository} from "../../repositories/user-repository";

dotenv.config()

export const loginMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(401)
        console.log('unsuccess login middleware, not found headers')
        return
    }

    const token = req.headers.authorization.split(' ')[1]

    const userId = await jwtService.getUserIdByAccessToken(token)
    if(!userId) {
        res.sendStatus(401)
        console.log('unsuccess login middleware, not found user by token')
        return
    }

    req.user = await UserRepository.getUserById(userId)
    if(!req.user) {
        console.log('user is null')
        res.sendStatus(404)
        return
    }
    console.log('success login middleware')
    next()
}