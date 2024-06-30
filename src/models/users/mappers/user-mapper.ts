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
    } | null | undefined
}> & { _id: ObjectId }): OutputUserModel {

    const accountData = value.accountData || {};
    return {
        id: value._id,
        login: accountData.login || '',
        email: accountData.email || '',
        createdAt: accountData.createdAt || '',
    };
}
