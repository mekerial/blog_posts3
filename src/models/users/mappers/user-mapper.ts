import { ObjectId, WithId } from "mongodb";
import { UserDbType } from "../../db/db-types";
import { OutputUserModel } from "../output";
import { FlattenMaps } from "mongoose";

export const userMapper = (userDB: WithId<UserDbType>): OutputUserModel => {
    return {
        id: userDB._id,
        login: userDB.accountData?.login || '',
        email: userDB.accountData?.email || '',
        createdAt: userDB.accountData?.createdAt || ''
    }
}

export function transformUserDB(value: FlattenMaps<{
    accountData?: {
        login?: string | null | undefined,
        email?: string | null | undefined,
        passwordHash?: string | null | undefined,
        passwordSalt?: string | null | undefined,
        createdAt?: string | null | undefined
    } | null | undefined,
    emailConfirmation?: {
        confirmationCode?: string | null | undefined,
        expirationDate?: Date | null | undefined,
        isConfirmed?: boolean | null | undefined;
    } | null | undefined,
}> & { _id: ObjectId }): OutputUserModel {

    const accountData = value.accountData || {};
    return {
        id: value._id,
        login: accountData.login || '',
        email: accountData.email || '',
        createdAt: accountData.createdAt || '',
    };
}


export function mapperUserDB(value: FlattenMaps<{
    accountData?: {
        login?: string | null | undefined,
        email?: string | null | undefined,
        passwordHash?: string | null | undefined,
        passwordSalt?: string | null | undefined,
        createdAt?: string | null | undefined
    } | null | undefined,
    emailConfirmation?: {
        confirmationCode?: string | null | undefined,
        expirationDate?: Date | null | undefined,
        isConfirmed?: boolean | null | undefined;
    } | null | undefined,
    likedComments: string[],
    dislikedComments: string[],
    likedPosts: string[],
    dislikedPosts: string[]
}> & { _id: ObjectId }) {

    const accountData = value.accountData || {};
    return {
        _id: value._id,
        accountData: {
            login: value.accountData?.login || '',
            email: value.accountData?.email || '',
            passwordHash: value.accountData?.passwordHash || '',
            passwordSalt: value.accountData?.passwordSalt || '',
            createdAt: value.accountData?.createdAt || '',
        } || null || undefined,
        emailConfirmation: {
            confirmationCode: value.emailConfirmation?.confirmationCode || '',
            expirationDate: value.emailConfirmation?.expirationDate!,
            isConfirmed: value.emailConfirmation?.isConfirmed || false
        } || null || undefined,
        likedComments: value.likedComments,
        dislikedComments: value.dislikedComments,
        likedPosts: value.likedPosts,
        dislikedPosts: value.dislikedPosts
    };
}