import {OutputCommentModel} from "../output";
import {ObjectId, WithId} from "mongodb";
import {CommentDbType} from "../../db/db-types";
import {FlattenMaps} from "mongoose";

export const commentMapper = (commentDB: WithId<CommentDbType>): OutputCommentModel => {
    return {
        content: commentDB.content,
        commentatorInfo: commentDB.commentatorInfo,
        createdAt: commentDB.createdAt,
        id: commentDB._id,
        likesInfo: commentDB.likesInfo
    }
}

export function transformCommentDB(value: FlattenMaps<{
    createdAt?: string | null | undefined;
    content?: string | null | undefined;
    commentatorInfo?: {
        userId?: string | null | undefined,
        userLogin?: string | null | undefined,
    } | null | undefined,
    likesInfo?: {
        likesCount?: number | null | undefined,
        dislikesCount?: number | null | undefined
    } | null | undefined;
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
        likesInfo: {
            likesCount: value.likesInfo?.likesCount || 0,
            dislikesCount: value.likesInfo?.dislikesCount || 0
        }
    };
}