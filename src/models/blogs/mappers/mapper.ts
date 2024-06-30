import {ObjectId, WithId} from "mongodb";
import {BlogDBType} from "../../db/db-types";
import {OutputBlogModel} from "../output";
import {FlattenMaps} from "mongoose";

export const blogMapper = (blogDB: WithId<BlogDBType>): OutputBlogModel => {
    return {
        id: blogDB._id.toString(),
        name: blogDB.name,
        description: blogDB.description,
        websiteUrl: blogDB.websiteUrl,
        createdAt: blogDB.createdAt,
        isMembership: blogDB.isMembership
    }
}

export function transformBlogDB(value: FlattenMaps<{ createdAt?: string | null | undefined;
    name?: string | null | undefined;
    description?: string | null | undefined;
    websiteUrl?: string | null | undefined;
    isMembership?: boolean | null | undefined; }> &
    { _id: ObjectId }): WithId<BlogDBType> {

    return {
        _id: value._id,
        createdAt: value.createdAt || '',
        name: value.name || '',
        description: value.description || '',
        websiteUrl: value.websiteUrl || '',
        isMembership: value.isMembership || false,
    };
}
