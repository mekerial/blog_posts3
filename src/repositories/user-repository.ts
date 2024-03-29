import {CreateUserWithHash, QueryUserInputModel} from "../models/users/input";
import {userCollection} from "../db/db";
import {userMapper} from "../models/users/mappers/user-mapper";
import {ObjectId} from "mongodb";
import {OutputUserModel} from "../models/users/output";

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

        const users = await userCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .map(userMapper)
            .toArray()

        const totalCount = await userCollection.countDocuments(filter)

        const pagesCount = Math.ceil(totalCount / +pageSize)

        return {
            page: +pageNumber,
            pageSize: +pageSize,
            pagesCount,
            totalCount,
            items: users
        }
    }
    static async getUserById(id: ObjectId): Promise<OutputUserModel | null> {
        const user = await userCollection.findOne({_id: new ObjectId(id)})
        if (!user) {
            return null
        }
        return userMapper(user)
    }
    static async findUserByLoginOrEmail(LoginOrEmail: string) {
        return await userCollection.findOne({$or: [{"accountData.email": LoginOrEmail}, {"accountData.login": LoginOrEmail}]})
    }
    static async createUser(createdData: CreateUserWithHash) {

        const user = {
            ...createdData,
        }

        const newUser = await userCollection.insertOne({...user})

        return userMapper({...user, _id: newUser.insertedId})
    }
    static async deleteUserById(id: string): Promise<boolean | null> {
        const user = await userCollection.deleteOne({_id: new ObjectId(id)})

        return !!user.deletedCount
    }
    static async getUserByVerifyCode(code: string) {
        return await userCollection.findOne({'emailConfirmation.confirmationCode': code})
    }
    static async updateConfirmation(_id: ObjectId) {
        const result = await userCollection.updateOne({_id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    }
    static async recoveryConfirmationVerifyCode(_id: ObjectId, code: string, date: Date) {
        await userCollection.updateOne({_id}, {$set: {'emailConfirmation.confirmationCode': code}})
        await userCollection.updateOne({_id}, {$set: {'emailConfirmation.expirationDate': date}})
        console.log('success update verify code')
        return true
    }
}
