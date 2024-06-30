import {ObjectId, WithId} from "mongodb";
import {PostDBType} from "../../db/db-types";
import {OutputPostModel} from "../output";
import {FlattenMaps} from "mongoose";

export const postMapper = (postDB: WithId<PostDBType>): OutputPostModel => {
    return {
        id: postDB._id,
        title: postDB.title,
        shortDescription: postDB.shortDescription,
        content: postDB.content,
        blogId: postDB.blogId,
        blogName: postDB.blogName,
        createdAt: postDB.createdAt
    }
}

export function transformPostDB(value: FlattenMaps<{
    createdAt?: string | null | undefined;
    title?: string | null | undefined;
    shortDescription?: string | null | undefined;
    content?: string | null | undefined;
    blogName?: string | null | undefined;
    blogId?: string | null | undefined;}> &
    { _id: ObjectId }): OutputPostModel {

    return {
        id: value._id,
        blogId: value.blogId || '',
        createdAt: value.createdAt || '',
        title: value.title || '',
        shortDescription: value.shortDescription || '',
        content: value.content || '',
        blogName: value.blogName || '',
    };
}