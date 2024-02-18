import {Router, Response} from 'express'
import {RequestWithBody, RequestWithQuery} from "../../common";
import {LoginInputModel} from "../../models/logins/input";
import {UserService} from "../../services/user-service";
import {jwtService} from "../../application/jwt-service";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";

export const authRoute = Router({})

authRoute.post('/login', async (req: RequestWithBody<LoginInputModel>, res: Response) => {
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

    const token = await jwtService.createJWT(newAuth)

    const ResponseToken = {
        accessToken: token.toString()
    }
    res.status(200).send(ResponseToken)
    console.log('post request | auth/login')
})
authRoute.get('/me', loginMiddleWare, async (req: RequestWithQuery<any>, res: Response) => {
    const userMe = {
        email: req.user!.email,
        login: req.user!.login,
        userId: req.user!.id
    }
    res.status(200)
    console.log('sended 200')
    res.send(userMe)
    console.log('success get request | auth/me')
})