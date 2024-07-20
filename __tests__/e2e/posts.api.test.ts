import request from "supertest";
import {app} from "../../src/settings";
import {RouterPaths} from "../../src/routes/router-paths";
import {
    dataTestPostCreate01,
    dataTestPostCreate02,
    dataTestPostCreate03, dataTestPostCreate04,
} from "../data-for-tests/post-data-for-tests";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {dataTestBlogCreate01} from "../data-for-tests/blog-data-for-tests";


dotenv.config()

const uri = process.env.MONGO_URI
if (!uri) {
    throw new Error(' ! uri error ! ')
}


const getRequest = () => {
    return request(app)
}

describe(RouterPaths.posts, () => {
    beforeAll(async () => {
        await mongoose.connect(uri)
        await getRequest()
            .delete(RouterPaths.testing)
            .expect(204)
    })
    beforeEach(async () => {
        await getRequest()
            .delete(RouterPaths.testing)
            .expect(204)
    })
    afterAll(async () => {
        await mongoose.disconnect()
    })



    it('should return empty array', async () => {
        const createResponse = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it('should create post to blog', async () => {
        const createBlog = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createBlog.body.id
        const checkBlog = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(checkBlog.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createBlog.body.createdAt,
            isMembership: false
        })

        const createPost = await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...dataTestPostCreate01, blogId: checkBlog.body._id})
            .expect(201)
        const checkPost = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)

        expect(checkPost.body.items).toEqual([{id: createPost.body.id,
            ...dataTestPostCreate01,
            blogId: checkBlog.body._id,
            createdAt: createPost.body.createdAt,
            blogName: createPost.body.blogName
        }])
    })
    it(`shouldn't create post with empty title to blog`, async () => {
        const createBlog = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createBlog.body.id
        const checkBlog = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(checkBlog.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createBlog.body.createdAt,
            isMembership: false
        })

        const createPost = await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...dataTestPostCreate01, title: ''})
            .expect(400)

        const checkPost = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)
        expect(checkPost.body.items).toStrictEqual([])
    })
    it(`shouldn't create post with long title to blog`, async () => {
        const createBlog = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createBlog.body.id
        const checkBlog = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(checkBlog.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createBlog.body.createdAt,
            isMembership: false
        })

        const createPost = await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...dataTestPostCreate02})
            .expect(400)

        const checkPost = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)
        expect(checkPost.body.items).toStrictEqual([])
    })
    it(`shouldn't create post with empty description to blog`, async () => {
        const createBlog = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createBlog.body.id
        const checkBlog = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(checkBlog.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createBlog.body.createdAt,
            isMembership: false
        })

        const createPost = await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...dataTestPostCreate03})
            .expect(400)

        const checkPost = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)
        expect(checkPost.body.items).toStrictEqual([])
    })
    it(`shouldn't create post with long description to blog`, async () => {
        const createBlog = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createBlog.body.id
        const checkBlog = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(checkBlog.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createBlog.body.createdAt,
            isMembership: false
        })

        const createPost = await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...dataTestPostCreate03})
            .expect(400)

        const checkPost = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)
        expect(checkPost.body.items).toStrictEqual([])
    })
    it(`shouldn't create post with empty content to blog`, async () => {
        const createBlog = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createBlog.body.id
        const checkBlog = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(checkBlog.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createBlog.body.createdAt,
            isMembership: false
        })

        const createPost = await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...dataTestPostCreate04, content: ''})
            .expect(400)

        const checkPost = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)
        expect(checkPost.body.items).toStrictEqual([])
    })
    it(`shouldn't create post with long content to blog`, async () => {
        const createBlog = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createBlog.body.id
        const checkBlog = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(checkBlog.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createBlog.body.createdAt,
            isMembership: false
        })

        const createPost = await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...dataTestPostCreate04})
            .expect(400)

        const checkPost = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)
        expect(checkPost.body.items).toStrictEqual([])
    })

})