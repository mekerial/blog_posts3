import express, {Request, Response} from "express";
import {blogRoute} from "./routes/blogs/blog-route";
import {postRoute} from "./routes/posts/post-route";
import {userRoute} from "./routes/users/user-route";
import {blogCollection, commentCollection, postCollection, userCollection} from "./db/db";
import {authRoute} from "./routes/auth/auth-route";
import {commentRoute} from "./routes/comments/comment-route";
import {emailRoute} from "./routes/email/email-route";

export const app = express()

app.use(express.json())
app.delete('/testing/all-data', async (req: Request, res: Response) => {
    // await database.dropDatabase()

    await blogCollection.deleteMany({})
    await postCollection.deleteMany({})
    await userCollection.deleteMany({})
    await commentCollection.deleteMany({})

    res.sendStatus(204)
})
app.use('/blogs', blogRoute)
app.use('/posts', postRoute)
app.use('/users', userRoute)
app.use('/auth', authRoute)
app.use('/comments', commentRoute)
app.use('/email', emailRoute)
