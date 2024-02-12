import {Router, Response} from "express"
import {
    Params,
    RequestWithBody,
    RequestWithParams,
    RequestWithQuery
} from "../../common";

import {CreateUserModel, QueryUserInputModel} from "../../models/users/input";
import {UserRepository} from "../../repositories/user-repository";
import {authMiddleware} from "../../middlewares/auth/auth-middleware";
import {ObjectId} from "mongodb";
import {userValidation} from "../../validators/user-validator";
import {UserService} from "../../services/user-service";


export const userRoute = Router({})

userRoute.get('/', authMiddleware, async (req: RequestWithQuery<QueryUserInputModel>, res: Response) => {
    const sortData = {
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        searchLoginTerm: req.query.searchLoginTerm,
        searchEmailTerm: req.query.searchEmailTerm
    }

    const users = await UserRepository.getAllUsers(sortData)

    res.status(200).send(users)
})

userRoute.post('/', authMiddleware, userValidation(), async (req: RequestWithBody<CreateUserModel>, res: Response) => {
    const login = req.body.login
    const password = req.body.password
    const email = req.body.email

    const newUser: CreateUserModel = {
        login,
        password,
        email
    }

    const createdUser = await UserService.createUser(newUser)

    res.status(201).send(createdUser)
})

userRoute.delete('/:id', authMiddleware, async (req: RequestWithParams<Params>, res: Response) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }

    const isDeletedUser = await UserRepository.deleteUserById(id)

    if (isDeletedUser) {
        res.sendStatus(204)
        return
    } else {
        res.sendStatus(404)
        return
    }
})
