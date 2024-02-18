import {commentatorInfo} from "../db/db-types";

export type OutputCommentModel = {
    id: string,
    content: string,
    commentatorInfo: commentatorInfo,
    createdAt: string
}