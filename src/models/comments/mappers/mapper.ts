import {OutputCommentModel} from "../output";
import {WithId} from "mongodb";
import {CommentDbType} from "../../db/db-types";

export const commentMapper = (commentDB: WithId<CommentDbType>): OutputCommentModel => {
    return {
        id: commentDB._id.toString(),
        content: commentDB.content,
        commentatorInfo: commentDB.commentatorInfo,
        createdAt: commentDB.createdAt
    }
}