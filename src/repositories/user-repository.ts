import {CreateUserWithHash, QueryUserInputModel, RecoveryPassword} from "../models/users/input";
import {recoveryPasswordModel, userModel} from "../db/db";
import {mapperUserDB, transformUserDB, userMapper} from "../models/users/mappers/user-mapper";
import {ObjectId, WithId} from "mongodb";
import {OutputUserModel} from "../models/users/output";
import {UserDbType} from "../models/db/db-types";
import mongoose from "mongoose";
import {UserService} from "../services/user-service";
import bcrypt from "bcrypt";

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
        const userId = new mongoose.Types.ObjectId(id);
        const user = await userModel.find({_id: userId}).lean()
        if (!user[0]) {
            return null
        }
        return transformUserDB(user[0])
    }
    static async findUserByLoginOrEmail(LoginOrEmail: string): Promise<WithId<UserDbType> | null> {

        const user = await userModel.find({$or: [{"accountData.email": LoginOrEmail}, {"accountData.login": LoginOrEmail}]}).lean();
        if (!user[0]) {
            return null
        }
        return mapperUserDB(user[0])
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
        console.log('success update confirmation verify code')
        return true
    }
    static async recoveryPasswordVerifyCode(_id: ObjectId, code: string, date: Date): Promise<WithId<RecoveryPassword> | boolean> {

        const userRcvryPassword = await recoveryPasswordModel.find({UserId: _id}).lean()

        if (!userRcvryPassword[0]) {
            await recoveryPasswordModel.insertMany([{
                UserId: _id,
                recoveryCode: '',
                expirationDate: ''
            }])
        }

        await recoveryPasswordModel.updateOne({_id}, {$set: {'recoveryCode': code}})
        await recoveryPasswordModel.updateOne({_id}, {$set: {'expirationDate': date}})
        console.log('success update recovery password verify code')
        return true
    }

    static async getRecoveryPasswordByVerifyCode(code: string) {
        const recoveryPassword = await recoveryPasswordModel.findOne({'recoveryCode': code});
        if (!recoveryPassword) {
            return null
        }
        return recoveryPassword.toObject()
    }
    static async updatePassword(_id: ObjectId, newPassword: string) {
        const passwordSalt = await bcrypt.genSalt(10)
        const newPasswordHash = UserService.generateHash(newPassword, passwordSalt)

        const result1 = await userModel.updateOne({_id}, {$set: {'accountData.passwordHash': newPasswordHash}})
        const result2 = await userModel.updateOne({_id}, {$set: {'accountData.passwordSalt': passwordSalt}})
        return result1.modifiedCount === 1 && result2.modifiedCount === 1
    }
}
