import {Router, Response} from "express";
import {Params, RequestWithBodyAndParams, RequestWithParams} from "../../common";
import {ObjectId} from "mongodb";
import {CommentRepository} from "../../repositories/comment-repository";
import {CreateCommentModel} from "../../models/comments/input";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";
import {commentValidation} from "../../validators/comment-validator";


export const commentRoute = Router({})

commentRoute.get('/:id', async (req: RequestWithParams<Params>, res: Response) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }

    const comment = await CommentRepository.getCommentById(id)
    res.status(200).send(comment)
})
commentRoute.put('/:id', loginMiddleWare, commentValidation(), async (req: RequestWithBodyAndParams<Params, CreateCommentModel>, res: Response) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const userId = req.user!.id
    const usersCommentId = (await CommentRepository.getCommentById(id))!.commentatorInfo.userId

    const updateData = req.body

    const isCommentUpdated = await CommentRepository.updateComment(id, updateData)

    if (isCommentUpdated) {
        if (userId != usersCommentId) {
            res.sendStatus(403)
            return
        }
        res.sendStatus(204)
        return
    } else {
        res.sendStatus(404)
        return
    }
})
commentRoute.delete('/:id', loginMiddleWare, async (req: RequestWithParams<Params>, res: Response) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }

    const userId = req.user!.id
    const usersCommentId = (await CommentRepository.getCommentById(id))!.commentatorInfo.userId
    if (userId != usersCommentId) {
        res.sendStatus(403)
        return
    }

    const isDeletedComment = await CommentRepository.deleteComment(id)

    if (isDeletedComment) {
        res.sendStatus(204)
        return
    } else {
        res.sendStatus(404)
        return
    }
})