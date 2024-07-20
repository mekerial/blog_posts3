import {Router, Response} from "express"
import {
    Params,
    RequestWithBody,
    RequestWithParams,
    RequestWithQuery
} from "../../common";

import {CreateUserModel, QueryUserInputModel, UserEmailModel} from "../../models/users/input";

import {authMiddleware} from "../../middlewares/auth/auth-middleware";
import {ObjectId} from "mongodb";
import {userValidation} from "../../validators/user-validator";
import {UserService} from "../../services/user-service";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns/add";

class UserController {
    private userService: UserService
    constructor() {
        this.userService = new UserService()
    }
    async getAllUsers(req: RequestWithQuery<QueryUserInputModel>, res: Response) {
        console.log('get on /users')

        const sortData = {
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            searchLoginTerm: req.query.searchLoginTerm,
            searchEmailTerm: req.query.searchEmailTerm
        }

        const users = await UserService.getAllUsers(sortData)

        res.status(200).send(users)
    }
    async createUser(req: RequestWithBody<CreateUserModel>, res: Response) {
        console.log('post on /users')

        const login = req.body.login
        const password = req.body.password
        const email = req.body.email

        const newUser: UserEmailModel = {
            accountData: {
                login: login,
                email: email,
                password: password,
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    // hours: 1
                    minutes: 3
                }),
                isConfirmed: false
            }
        }

        const createdUser = await UserService.createUser(newUser)

        res.status(201).send(createdUser)
    }
    async deleteUserById(req: RequestWithParams<Params>, res: Response) {
        console.log('delete on /users/:id')

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }

        const isDeletedUser = await UserService.deleteUserById(id)

        if (isDeletedUser) {
            res.sendStatus(204)
            return
        } else {
            res.sendStatus(404)
            return
        }
    }
}

const userController = new UserController()

export const userRoute = Router({})

userRoute.get('/', authMiddleware, userController.getAllUsers.bind(userController))
userRoute.post('/', authMiddleware, userValidation(), userController.createUser.bind(userController))
userRoute.delete('/:id', authMiddleware, userController.deleteUserById.bind(userController))
