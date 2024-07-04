import {Router, Response} from "express"
import {BlogRepository} from "../../repositories/blog-repository";
import {
    Params,
    RequestWithBody,
    RequestWithBodyAndParams,
    RequestWithParams,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../common";
import {authMiddleware} from "../../middlewares/auth/auth-middleware";
import {blogValidation} from "../../validators/blog-validator";
import {
    CreateBlogModel,
    CreatePostBlogModel,
    QueryBlogInputModel,
    QueryPostByBlogIdInputModel
} from "../../models/blogs/input";
import {ObjectId} from "mongodb";
import {PostRepository} from "../../repositories/post-repository";
import {blogPostValidation} from "../../validators/blog-post-validator";
import {CreatePostModel} from "../../models/posts/input";
import {OutputPostModel} from "../../models/posts/output";


export const blogRoute = Router({})

blogRoute.get('/', async (req: RequestWithQuery<QueryBlogInputModel>, res: Response) => {
    const sortData = {
        searchNameTerm: req.query.searchNameTerm,
        sortBy: req.query.sortBy,
        sortDirection:  req.query.sortDirection,
        pageNumber:  req.query.pageNumber,
        pageSize: req.query.pageSize
    }
    const blogs = await BlogRepository.getAllBlogs(sortData)

    res.send(blogs)
})
blogRoute.get('/:id', async (req: RequestWithParams<Params>, res: Response) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return;
    }

    const blog = await BlogRepository.getBlogById(id)

    if(!blog) {
        res.sendStatus(404)
        return;
    }

    res.send(blog)
})
blogRoute.get('/:id/posts', async (req: RequestWithParamsAndQuery<Params, QueryPostByBlogIdInputModel>, res: Response) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const blog = await BlogRepository.getBlogById(id)
    if (!blog) {
        res.sendStatus(404)
        return
    }

    const sortData = {
        sortBy: req.query.sortBy,
        sortDirection:  req.query.sortDirection,
        pageNumber:  req.query.pageNumber,
        pageSize: req.query.pageSize
    }

    const posts = await BlogRepository.getPostsByBlogId(id, sortData)

    res.send(posts)
})
blogRoute.post('/:id/posts', authMiddleware, blogPostValidation(), async (req: RequestWithBodyAndParams<Params, CreatePostModel>, res: Response<OutputPostModel>) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return;
    }

    const title = req.body.title
    const shortDescription = req.body.shortDescription
    const content = req.body.content


    const blog = await BlogRepository.getBlogById(id)

    if (!blog) {
        res.sendStatus(404)
        return
    }

    const newPost = {
        title,
        shortDescription,
        content,
    }

    const createdPost = await PostRepository.createPost({...newPost, blogId: id})

    res.status(201).send(createdPost)
})
blogRoute.post('/', authMiddleware, blogValidation(), async (req: RequestWithBody<CreateBlogModel>, res: Response) => {
    const name = req.body.name
    const description = req.body.description
    const websiteUrl = req.body.websiteUrl

    const newBlog: CreateBlogModel = {
        name,
        description,
        websiteUrl
    }

    const createdBlog = await BlogRepository.createBlog(newBlog)

    res.status(201).send(createdBlog)
})
blogRoute.post('/:id/posts', authMiddleware, async (req: RequestWithBodyAndParams<{id: string}, CreatePostBlogModel>, res: Response) => {
    const title = req.body.title
    const shortDescription = req.body.shortDescription
    const content = req.body.content
    const blogId = req.params.id

    const blog = await BlogRepository.getBlogById(blogId)
    if (!blog) {
        res.sendStatus(404)
        return
    }

    const createdPostId = await BlogRepository.createPostToBlog(blogId, {title, shortDescription, content})

    const post = await PostRepository.getPostById(createdPostId.toString())

    if (!post) {
        res.sendStatus(404)
        return
    }

    res.status(201).send(post)
})
blogRoute.put('/:id', authMiddleware, blogValidation(), async (req: RequestWithBodyAndParams<Params, any>, res: Response) => {
    console.log('put /blogs')
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return;
    }
    console.log('id is valid')

    const name = req.body.name
    const description = req.body.description
    const websiteUrl = req.body.websiteUrl

    console.log('getting blog by id')
    const blog = await BlogRepository.getBlogById(id)

    if (!blog) {
        res.sendStatus(404)
        return
    }

    console.log('updating blog by id')
    const isBlogUpdated = await BlogRepository.updateBlog(id, {name, description, websiteUrl})

    if (isBlogUpdated) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})
blogRoute.delete('/:id', authMiddleware, async (req: RequestWithParams<Params>, res: Response) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }

    const isDeletedBlog = await BlogRepository.deleteBlogById(id)

    if (isDeletedBlog) {
        res.sendStatus(204)
        return
    } else {
        res.sendStatus(404)
        return
    }
})