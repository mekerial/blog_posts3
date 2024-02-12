import {WithId} from "mongodb";
import {UserDbType} from "../../db/db-types";
import {OutputUserModel} from "../output";

export const userMapper = (userDB: WithId<UserDbType>): OutputUserModel => {
    return {
        id: userDB._id.toString(),
        login: userDB.login,
        email: userDB.email,
        createdAt: userDB.createdAt
    }
}