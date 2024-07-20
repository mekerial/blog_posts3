import {commentatorInfo} from "../db/db-types";
import {ObjectId} from "mongodb";

export type OutputCommentModel = {
    id: ObjectId,
    content: string,
    commentatorInfo: commentatorInfo,
    createdAt: string
    likesInfo: {
        likesCount: number,
        dislikesCount: number
    }
}