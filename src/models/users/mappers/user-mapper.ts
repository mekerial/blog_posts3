import {WithId} from "mongodb";
import {UserDbType} from "../../db/db-types";
import {OutputUserModel} from "../output";

export const userMapper = (userDB: WithId<UserDbType>): OutputUserModel => {
    return {
        id: userDB._id.toString(),
        login: userDB.accountData.login,
        email: userDB.accountData.email,
        createdAt: userDB.accountData.createdAt
    }
}