import {ObjectId} from "mongodb";

export type OutputPostModel = {
    id: ObjectId,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        newestLikes: {
            addedAt: string,
            userId: string,
            login: string
        }[]
    }
}

