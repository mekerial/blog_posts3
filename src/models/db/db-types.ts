import {OutputBlogModel} from "../blogs/output";
import {OutputPostModel} from "../posts/output";

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
    login: string,
    email: string,
    passwordHash: string,
    passwordSalt: string,
    createdAt: string
}