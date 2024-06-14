import {WithId} from "mongodb";
import {sessionDbType} from "../../db/db-types";
import {OutputSessionModel} from "../output";

export const sessionMapper = (sessionDB: WithId<sessionDbType>): OutputSessionModel => {
    return {
        ip: sessionDB.ip,
        title: sessionDB.deviceName,
        lastActiveDate: sessionDB.lastActivityDate,
        deviceId: sessionDB.deviceId
    }
}