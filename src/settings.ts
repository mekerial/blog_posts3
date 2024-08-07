import express, {Request, Response} from "express";
import {blogRoute} from "./routes/blogs/blog-route";
import {postRoute} from "./routes/posts/post-route";
import {userRoute} from "./routes/users/user-route";
import {authRoute} from "./routes/auth/auth-route";
import {commentRoute} from "./routes/comments/comment-route";
import {emailRoute} from "./routes/email/email-route";
import cookieParser from "cookie-parser";
import {securityRoute} from "./routes/security/security-route";
import {
    blogModel,
    commentModel,
    postModel,
    recoveryPasswordModel,
    refreshTokenModel,
    sessionModel,
    userModel
} from "./db/db";

export const app = express()

app.use(express.json())
app.use(cookieParser())

app.delete('/testing/all-data', async (req: Request, res: Response) => {
    console.log('!!!DATABASE IS DROPED!!!')

    // await database.dropDatabase()

    await blogModel.deleteMany({})
    await postModel.deleteMany({})
    await userModel.deleteMany({})
    await commentModel.deleteMany({})
    await refreshTokenModel.deleteMany({})
    await sessionModel.deleteMany({})
    await recoveryPasswordModel.deleteMany({})

    res.sendStatus(204)
})
app.use('/blogs', blogRoute)
app.use('/posts', postRoute)
app.use('/users', userRoute)
app.use('/auth', authRoute)
app.use('/comments', commentRoute)
app.use('/email', emailRoute)
app.use('/security', securityRoute)


