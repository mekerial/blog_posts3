import {Router, Response} from 'express';
import {RequestWithBody, RequestWithQuery} from "../../common";
import {LoginInputModel} from "../../models/logins/input";
import {UserService} from "../../services/user-service";
import {jwtService} from "../../application/jwt-service";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";
import {
    emailOnlyValidation,
    newPasswordValidation,
    userValidation
} from "../../validators/user-validator";
import {
    AccessTokenModel,
    CreateUserModel,
    EmailConfirmationCode,
    RecoveryPassword,
    ResendingEmailModel
} from "../../models/users/input";
import {emailAdapter} from "../../adapters/email/email-adapter";
import {emailSubject} from "../../adapters/email/email-manager";
import {v4 as uuidv4} from 'uuid'
import {add} from "date-fns/add";
import {UserRepository} from "../../repositories/user-repository";
import {registrationMiddleWare} from "../../middlewares/auth/registration-middleware";
import {emailConfirmationByCodeMiddleWare} from "../../middlewares/auth/email-confirmation-by-code-middleware";
import {emailConfirmationByEmailMiddleWare} from "../../middlewares/auth/email-confirmation-by-email-middleware";
import {SecurityService} from "../../services/security-service";
import {registrationLimiter, loginLimiter, emailLimiter} from "../../middlewares/auth/limiter-middleware";

class AuthController {
    async userLogin(req: RequestWithBody<LoginInputModel>, res: Response) {
        console.log('post on /auth/login')

        const loginOrEmail = req.body.loginOrEmail
        const password = req.body.password

        const deviceTitle = req.headers["user-agent"] || "new device"
        const IP = req.ip || "no ip"

        const auth = {
            loginOrEmail,
            password
        }

        const newAuth = await UserService.checkCredentials(auth)

        if (!newAuth) {
            res.sendStatus(401)
            return
        }
        const userId = newAuth._id

        const deviceId = uuidv4()

        const token = await jwtService.createJWT(userId)
        const refreshToken = await jwtService.createRefreshToken(userId, deviceId)

        const accessToken = {
            accessToken: token.toString()
        }

        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        res.cookie('deviceId', deviceId, {httpOnly: true, secure: true})

        await SecurityService.createSession(IP, deviceTitle, deviceId, userId, refreshToken)

        res.status(200).send(accessToken)
        console.log('post request | auth/login')
    }

    async getMePage(req: RequestWithQuery<any>, res: Response) {
        console.log('get on /auth/me')

        const userMe = {
            email: req.user!.email,
            login: req.user!.login,
            userId: req.user!.id
        }
        res.status(200)
        console.log('sended 200')
        res.send(userMe)
        console.log('success get request | auth/me')
    }

    async registrationUser(req: RequestWithBody<CreateUserModel>, res: Response) {
        console.log('post on /auth/registration')

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
        <a href='https://blog-posts3.onrender.com/registration-confirmation?code=${code}'>complete registration</a>
        </p>
    `);
        }

        res.sendStatus(204);
    }

    async confirmEmail(req: RequestWithBody<EmailConfirmationCode>, res: Response) {
        console.log('post on /registration-confirmation')

        const emailCode = req.body.code
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
    }

    async resendEmailConfirm(req: RequestWithBody<ResendingEmailModel>, res: Response) {
        console.log('post on /auth/registration-email-resending')

        const email = req.body.email
        const user = await UserRepository.findUserByLoginOrEmail(email)

        if (!user) {
            res.sendStatus(404)
            console.log('email not found')
            return
        }
        if (user.emailConfirmation.isConfirmed) {
            res.sendStatus(400)
            console.log('email already confirmed')
            return
        }

        const code = uuidv4()
        const date = add(new Date(), {
            // hours: 1
            minutes: 5
        })
        await UserRepository.recoveryConfirmationVerifyCode(user._id, code, date)

        const result = await emailAdapter.sendEmail(email, emailSubject.confirmationRegistration, `
        <h1>Thanks for your registration</h1>
        <p>To finish registration please follow the link below:
        <a href='https://blog-posts3.onrender.com/registration-confirmation?code=${code}'>complete registration</a>
        </p>
    `);

        if (!result) {
            res.sendStatus(400)
            console.log('not resend')
            return
        }

        console.log('success resend on email')
        res.sendStatus(204)
    }

    async getRefreshToken(req: RequestWithBody<AccessTokenModel>, res: Response) {
        console.log('post on /refresh-token')

        const refreshToken = req.cookies.refreshToken
        const deviceId = req.cookies.deviceId
        const updateTokens = await jwtService.updateAccessTokenByRefreshToken(refreshToken, deviceId)

        if (!updateTokens) {
            res.sendStatus(401)
            return
        }
        const newAccessToken = updateTokens.accessToken
        const newRefreshToken = updateTokens.refreshToken


        res.cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
        res.status(200)
        res.send({accessToken: newAccessToken})
    }

    async userLogout(req: RequestWithBody<string>, res: Response) {
        console.log('post on /auth/logout')

        const refreshToken = req.cookies.refreshToken

        const logout = await jwtService.revokeRefreshToken(refreshToken)
        if (!logout) {
            res.sendStatus(401)
            return
        }

        const result = await SecurityService.deleteSessionByRefreshToken(refreshToken)
        if (!result) {
            res.sendStatus(404)
            return
        }

        res.sendStatus(204)
    }

    async recoveryPassword(req: RequestWithBody<{ email: string }>, res: Response) {
        console.log('post on /password-recovery')

        const email = req.body.email
        const user = await UserRepository.findUserByLoginOrEmail(email)

        if (!user) {
            res.sendStatus(204)
            console.log('email not found')
            return
        }

        const code = uuidv4()
        const date = add(new Date(), {
            // hours: 1
            minutes: 30
        })
        await UserRepository.recoveryPasswordVerifyCode(user._id, code, date)

        const result = await emailAdapter.sendEmail(email, emailSubject.passwordRecovery, `
        <h1>Password recovery</h1>
        <p>To recovery password use this link:
        <a href='https://88f325575a9133.lhr.life/new-password?recoveryCode=${code}'>password recovery</a>
        </p>
    `);

        if (!result) {
            res.sendStatus(400)
            console.log('not send password recovery letter')
            return
        }

        res.sendStatus(204)
    }

    async createNewPassword(req: RequestWithBody<RecoveryPassword>, res: Response) {
        console.log('post on /new-password')

        const recoveryCode = req.body.recoveryCode
        const newPassword = req.body.newPassword

        const userRcvryCode = await UserRepository.getRecoveryPasswordByVerifyCode(recoveryCode)
        if (!userRcvryCode) {
            res.status(400).send({errorsMessages: [{message: 'incorrect recoveryCode!', field: "recoveryCode"}]})
            return
        }

        if (recoveryCode === userRcvryCode!.recoveryCode && userRcvryCode!.expirationDate! > new Date()) {

            const result = await UserRepository.updatePassword(userRcvryCode!.userId!, newPassword)

            if (!result) {
                res.sendStatus(500)
                return
            }

            console.log('was recovery password')
            res.sendStatus(204)
            return
        } else {
            res.status(400).send({errorsMessages: [{message: 'incorrect recoveryCode!', field: "recoveryCode"}]})
            return
        }

        res.sendStatus(204)
    }
}

const userController = new AuthController()

export const authRoute = Router({})

authRoute.post('/login', loginLimiter, userController.userLogin)
authRoute.get('/me', loginMiddleWare, userController.getMePage)
authRoute.post('/registration', registrationLimiter, registrationMiddleWare(), userValidation(), userController.registrationUser)
authRoute.post('/registration-confirmation', registrationLimiter, emailConfirmationByCodeMiddleWare(), userController.confirmEmail)
authRoute.post('/registration-email-resending', emailLimiter, emailConfirmationByEmailMiddleWare(), userController.resendEmailConfirm)
authRoute.post('/refresh-token', userController.getRefreshToken)
authRoute.post('/logout', userController.userLogout)
authRoute.post('/password-recovery', emailOnlyValidation(), emailLimiter, userController.recoveryPassword)
authRoute.post('/new-password', registrationLimiter, newPasswordValidation(), userController.createNewPassword)