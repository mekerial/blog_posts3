export type CreatePostModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}

export type UpdatePostModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}

export type QueryPostInputModel = {
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
}