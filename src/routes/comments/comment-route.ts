import {Router, Response} from "express";
import {Params, RequestWithBodyAndParams, RequestWithParams} from "../../common";
import {ObjectId} from "mongodb";
import {CommentRepository} from "../../repositories/comment-repository";
import {CreateCommentModel} from "../../models/comments/input";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";
import {commentValidation} from "../../validators/comment-validator";


export const commentRoute = Router({})

commentRoute.get('/:id', async (req: RequestWithParams<Params>, res: Response) => {
    console.log('get request | comments/:id')

    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }

    const comment = await CommentRepository.getCommentById(id)

    if (!comment) {
        res.sendStatus(404)
        return
    }

    res.send(comment)
})
commentRoute.put('/:id', loginMiddleWare, commentValidation(), async (req: RequestWithBodyAndParams<Params, CreateCommentModel>, res: Response) => {
    console.log('put request | comments/:id')

    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const userId = req.user!.id
    const usersCommentId = await CommentRepository.getCommentById(id)
    if (!usersCommentId) {
        res.sendStatus(404)
        return
    }

    if (userId.toString() != usersCommentId!.commentatorInfo.userId) {
        res.sendStatus(403)
        return
    }

    const updateData = req.body

    const isCommentUpdated = await CommentRepository.updateComment(id, updateData)

    if (isCommentUpdated) {
        res.sendStatus(204)
        return
    } else {
        res.sendStatus(404)
        return
    }
})
commentRoute.delete('/:id', loginMiddleWare, async (req: RequestWithParams<Params>, res: Response) => {
    console.log('del request | comments/:id')
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }

    const userId = req.user!.id
    if (!userId) {
        res.sendStatus(404)
        return
    }

    const userComment = await CommentRepository.getCommentById(id)
    if (!userComment) {
        res.sendStatus(404)
        return
    }

    if (userId.toString() != userComment.commentatorInfo.userId) {
        res.sendStatus(403)
        return
    }

    const isDeletedComment = await CommentRepository.deleteComment(id)

    if (isDeletedComment) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})