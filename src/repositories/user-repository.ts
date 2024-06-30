import {CreateUserWithHash, QueryUserInputModel} from "../models/users/input";
import {userModel} from "../db/db";
import {transformUserDB, userMapper} from "../models/users/mappers/user-mapper";
import {ObjectId, WithId} from "mongodb";
import {OutputUserModel} from "../models/users/output";
import {UserDbType} from "../models/db/db-types";

export class UserRepository {
    static async getAllUsers(sortData: QueryUserInputModel) {
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = sortData.pageSize ?? 10
        const searchLoginTerm = sortData.searchLoginTerm ?? null
        const searchEmailTerm = sortData.searchEmailTerm ?? null

        let filter = {}
        let filterOptions = []


        if (searchLoginTerm) {
            filterOptions.push({
                login: {
                    $regex: searchLoginTerm,
                    $options: 'i'
                }
            })
        }
        if (searchEmailTerm) {
            filterOptions.push({
                email: {
                    $regex: searchEmailTerm,
                    $options: 'i'
                }
            })
        }
        if (filterOptions.length > 1) {
            filter = {
                $or: filterOptions
            }
        } else {
            filter = filterOptions[0]
        }

        const users = await userModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .lean()

        const totalCount = await userModel.countDocuments(filter)

        const pagesCount = Math.ceil(totalCount / +pageSize)

        return {
            page: +pageNumber,
            pageSize: +pageSize,
            pagesCount,
            totalCount,
            items: users.map(transformUserDB)
        }
    }
    static async getUserById(id: ObjectId): Promise<OutputUserModel | null> {
        const user = await userModel.findOne({_id: new ObjectId(id)})
        if (!user) {
            return null
        }
        return transformUserDB(user)
    }
    static async findUserByLoginOrEmail(LoginOrEmail: string): Promise<WithId<UserDbType> | null> {
        const user = await userModel.findOne({$or: [{"accountData.email": LoginOrEmail}, {"accountData.login": LoginOrEmail}]});
        if (!user) {
            return null
        }
        return user.toObject()
    }
    static async createUser(createdData: CreateUserWithHash) {

        const user = {
            ...createdData,
        }

        const newUser = await userModel.insertMany([{...user}])

        const insertedUser = newUser[0]
        const insertedId = insertedUser._id

        return userMapper({...user, _id: insertedId})
    }
    static async deleteUserById(id: string): Promise<boolean | null> {
        const user = await userModel.deleteOne({_id: new ObjectId(id)})

        return !!user.deletedCount
    }
    static async getUserByVerifyCode(code: string): Promise<WithId<UserDbType> | null> {
        const user = await userModel.findOne({'emailConfirmation.confirmationCode': code});
        if (!user) {
            return null
        }
        return user.toObject()
    }
    static async updateConfirmation(_id: ObjectId) {
        const result = await userModel.updateOne({_id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    }
    static async recoveryConfirmationVerifyCode(_id: ObjectId, code: string, date: Date) {
        await userModel.updateOne({_id}, {$set: {'emailConfirmation.confirmationCode': code}})
        await userModel.updateOne({_id}, {$set: {'emailConfirmation.expirationDate': date}})
        console.log('success update verify code')
        return true
    }
}
