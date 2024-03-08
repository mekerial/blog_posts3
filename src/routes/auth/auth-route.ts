import {Router, Response} from 'express';
import {RequestWithBody, RequestWithQuery} from "../../common";
import {LoginInputModel, QueryConfirmInputModel} from "../../models/logins/input";
import {UserService} from "../../services/user-service";
import {jwtService} from "../../application/jwt-service";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";
import {userValidation} from "../../validators/user-validator";
import {CreateUserModel, ResendingEmailModel} from "../../models/users/input";
import {emailAdapter} from "../../adapters/email/email-adapter";
import {emailSubject} from "../../adapters/email/email-manager";
import {v4 as uuidv4} from 'uuid'
import {add} from "date-fns/add";
import {UserRepository} from "../../repositories/user-repository";
import {registrationMiddleWare} from "../../middlewares/auth/registration-middleware";

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
authRoute.post('/registration', registrationMiddleWare(), userValidation(), async (req: RequestWithBody<CreateUserModel>, res: Response) => {
    const user = {
        accountData: {
            login: req.body.login,
            email: req.body.email,
            password: req.body.password,
        },
        emailConfirmation: {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {
                // hours: 1
                minutes: 5
            }),
            isConfirmed: false
        }
    }
    const code = user.emailConfirmation.confirmationCode

    const createUser = await UserService.createUserWithEmailConfirm(user)

    if (createUser) {
        await emailAdapter.sendEmail(user.accountData.email, emailSubject.confirmationRegistration, `
        <h1>Thanks for your registration</h1>
        <p>To finish registration please follow the link below:
        <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>
    `);
    }

    res.sendStatus(204);
})
authRoute.post('/registration-confirmation', async (req: RequestWithQuery<QueryConfirmInputModel>, res: Response) => {
    console.log('post on /registration-confirmation')
    const emailCode = req.query.code
    const user = await UserRepository.getUserByVerifyCode(emailCode)
    if (!user) {
        res.sendStatus(404)
        return
    }

    if (emailCode === user!.emailConfirmation.confirmationCode && user!.emailConfirmation.expirationDate > new Date()) {
        const result = await UserRepository.updateConfirmation(user._id)

        if (!result) {
            res.sendStatus(500)
            return
        }

        console.log('user email confirmed')
        res.sendStatus(204)
        return
    }
})
authRoute.post('/registration-email-resending', async (req: RequestWithBody<ResendingEmailModel>, res: Response) => {
    const email = req.body.email
    const user = await UserRepository.findUserByLoginOrEmail(email)

    if (!user) {
        res.sendStatus(404)
        return
    }

    const code = user.emailConfirmation.confirmationCode

    await emailAdapter.sendEmail(email, emailSubject.confirmationRegistration, `
        <h1>Thanks for your registration</h1>
        <p>To finish registration please follow the link below:
        <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>
    `);

    res.sendStatus(204);
})