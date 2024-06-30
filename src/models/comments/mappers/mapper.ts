import {OutputCommentModel} from "../output";
import {ObjectId, WithId} from "mongodb";
import {CommentDbType} from "../../db/db-types";
import {FlattenMaps} from "mongoose";

export const commentMapper = (commentDB: WithId<CommentDbType>): OutputCommentModel => {
    return {
        content: commentDB.content,
        commentatorInfo: commentDB.commentatorInfo,
        createdAt: commentDB.createdAt,
        id: commentDB._id
    }
}

export function transformCommentDB(value: FlattenMaps<{
    createdAt?: string | null | undefined;
    content?: string | null | undefined;
    commentatorInfo?: {
        userId: string,
        userLogin: string,
    };
    }> &
    { _id: ObjectId }): OutputCommentModel {

    return {
        id: value._id,
        commentatorInfo: {
            userId: value.commentatorInfo?.userId || '',
            userLogin: value.commentatorInfo?.userLogin || '',
        },
        createdAt: value.createdAt || '',
        content: value.content || '',
    };
}