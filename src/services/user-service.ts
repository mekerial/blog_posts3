import {LoginInputModel} from "../models/logins/input";
import {CreateUserModel} from "../models/users/input";
import {UserDbType} from "../models/db/db-types";
import bcrypt from 'bcrypt'
import {UserRepository} from "../repositories/user-repository";
import {OutputUserModel} from "../models/users/output";

export class UserService {
    static async createUser(CreatedData: CreateUserModel): Promise<OutputUserModel> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this.generateHash(CreatedData.password, passwordSalt)

        const newUser: UserDbType = {
            login: CreatedData.login,
            email: CreatedData.email,
            passwordHash: passwordHash,
            passwordSalt: passwordSalt,
            createdAt: new Date().toISOString(),
        }

        return UserRepository.createUser(newUser)
    }
    static async checkCredentials(auth: LoginInputModel): Promise<boolean | null> {
        const loginOrEmail = auth.loginOrEmail
        const user = await UserRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) return false

        const passwordHash = await UserService.generateHash(auth.password, user.passwordSalt)
        if (passwordHash === user.passwordHash) {
            return true
        }
        return false
    }
    static async generateHash(password: string, passwordSalt: string) {
        return await bcrypt.hash(password, passwordSalt)
    }
}