export type CreateBlogModel = {
    name: string,
    description: string,
    websiteUrl: string
}

export type CreatePostBlogModel = {
    title: string,
    shortDescription: string,
    content: string
}

export type UpdateBlogModel = {
    name: string,
    description: string,
    websiteUrl: string
}

export type QueryBlogInputModel = {
    searchNameTerm?: string,
    sortBy?: string,
    sortDirection?: string,
    pageNumber?: number,
    pageSize?: number
}

export type QueryPostByBlogIdInputModel = {
    sortBy?: string,
    sortDirection?: string,
    pageNumber?: number,
    pageSize?: number
}