export type CreateCommentModel = {
    content: string
}

export type UpdateCommentModel = {
    content: string
}

export type QueryCommentInputModel = {
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
}