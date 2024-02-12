import {WithId} from "mongodb";
import {PostDBType} from "../../db/db-types";
import {OutputPostModel} from "../output";

export const postMapper = (postDB: WithId<PostDBType>): OutputPostModel => {
    return {
        id: postDB._id.toString(),
        title: postDB.title,
        shortDescription: postDB.shortDescription,
        content: postDB.content,
        blogId: postDB.blogId,
        blogName: postDB.blogName,
        createdAt: postDB.createdAt
    }
}