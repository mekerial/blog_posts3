import {LoginInputModel} from "../models/logins/input";
import {QueryUserInputModel, UserEmailModel} from "../models/users/input";
import {UserDbType} from "../models/db/db-types";
import bcrypt from 'bcrypt'
import {UserRepository} from "../repositories/user-repository";
import {OutputUserModel} from "../models/users/output";

export class UserService {
    usersRepository: UserRepository
    constructor() {
        this.usersRepository = new UserRepository()
    }
    static async getAllUsers(sortData: QueryUserInputModel) {
        return await UserRepository.getAllUsers(sortData)
    }
    static async createUser(CreatedData: UserEmailModel): Promise<OutputUserModel> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this.generateHash(CreatedData.accountData.password, passwordSalt)

        const newUser: UserDbType = {
            accountData: {
                login: CreatedData.accountData.login,
                email: CreatedData.accountData.email,
                passwordHash: passwordHash,
                passwordSalt: passwordSalt,
                createdAt: new Date().toISOString(),
            },
            emailConfirmation: {
                confirmationCode: '',
                expirationDate: new Date(),
                isConfirmed: true
            },
            likedComments: [],
            dislikedComments: [],
        }

        return UserRepository.createUser(newUser)
    }
    static async createUserWithEmailConfirm(CreatedData: UserEmailModel): Promise<OutputUserModel> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this.generateHash(CreatedData.accountData.password, passwordSalt)

        const newUser: UserDbType = {
            accountData: {
                login: CreatedData.accountData.login,
                email: CreatedData.accountData.email,
                passwordHash: passwordHash,
                passwordSalt: passwordSalt,
                createdAt: new Date().toISOString(),
            },
            emailConfirmation: {
                confirmationCode: CreatedData.emailConfirmation.confirmationCode,
                expirationDate: CreatedData.emailConfirmation.expirationDate,
                isConfirmed: false
            },
            likedComments: [],
            dislikedComments: []
        }

        return UserRepository.createUser(newUser)
    }
    static async checkCredentials(auth: LoginInputModel) {
        const loginOrEmail = auth.loginOrEmail
        const user = await UserRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) return false

        const passwordHash = await this.generateHash(auth.password, user.accountData.passwordSalt)
        if (passwordHash === user.accountData.passwordHash) {
            return user
        }
        return false
    }
    static async generateHash(password: string, passwordSalt: string) {
        return await bcrypt.hash(password, passwordSalt)
    }

    static async deleteUserById(id: string) {
        return await UserRepository.deleteUserById(id)
    }
}