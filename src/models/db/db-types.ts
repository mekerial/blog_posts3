import {OutputBlogModel} from "../blogs/output";
import {OutputPostModel} from "../posts/output";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns/add";

export type DBType = {
    blogs: OutputBlogModel[],
    posts: OutputPostModel[]
}

export type BlogDBType = {
    name: string,
    description: string,
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type PostDBType = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string
}

export type UserDbType = {
    accountData: {
        login: string,
        email: string,
        passwordHash: string,
        passwordSalt: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    }
}

export type CommentDbType = {
    content: string,
    commentatorInfo: commentatorInfo,
    createdAt: string,
    postId: string
}

export type commentatorInfo = {
    userId: string,
    userLogin: string,
}
