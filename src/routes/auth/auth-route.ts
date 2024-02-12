import {Router, Response} from 'express'
import {RequestWithBody} from "../../common";
import {LoginInputModel} from "../../models/logins/input";
import {UserService} from "../../services/user-service";

export const authRoute = Router({})

authRoute.post('/', async (req: RequestWithBody<LoginInputModel>, res: Response) => {
    const loginOrEmail = req.body.loginOrEmail
    const password = req.body.password

    const auth = {
        loginOrEmail,
        password
    }

    const newAuth = await UserService.checkCredentials(auth)

    if (!newAuth) {
        res.sendStatus(401)
        return
    }

    res.sendStatus(204)
})