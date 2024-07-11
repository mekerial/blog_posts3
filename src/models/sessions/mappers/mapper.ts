import {ObjectId, WithId} from "mongodb";
import {sessionDbType} from "../../db/db-types";
import {OutputSessionModel} from "../output";
import {FlattenMaps} from "mongoose";

export const sessionMapper = (sessionDB: WithId<sessionDbType>): OutputSessionModel => {
    return {
        ip: sessionDB.ip,
        title: sessionDB.deviceName,
        lastActiveDate: sessionDB.lastActiveDate,
        deviceId: sessionDB.deviceId
    }
}

export function transformSessionDB(value: FlattenMaps<{
    ip?: string | null | undefined;
    title?: string | null | undefined;
    lastActiveDate?: string | null | undefined;
    deviceId?: string | null | undefined;
}> &
    { _id: ObjectId }): OutputSessionModel {

    return {
        ip: value.ip || '',
        title: value.title || '',
        lastActiveDate: value.lastActiveDate || '',
        deviceId: value.deviceId || '',
    };
}

export function mapperSessionDB(value: FlattenMaps<{
    issuedAt: string | null | undefined,
    lastActiveDate?: string | null | undefined;
    deviceId?: string | null | undefined;
    ip?: string | null | undefined;
    deviceName?: string | null | undefined;
    userId?: ObjectId;
    refreshToken?: string | null | undefined;
}> &
    { _id: ObjectId }): sessionDbType {

    return {
        issuedAt: value.issuedAt || '',
        lastActiveDate: value.lastActiveDate || '',
        deviceId: value.deviceId || '',
        ip: value.ip || '',
        deviceName: value.deviceName || '',
        userId: value.userId!,
        refreshToken: value.refreshToken || '',
    } || null || undefined;
}