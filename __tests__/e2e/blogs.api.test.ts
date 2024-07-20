import request from "supertest";
import {app} from "../../src/settings";
import {RouterPaths} from "../../src/routes/router-paths";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {BlogPaginationView, dataTestBlogCreate01, incorrectInputData} from "../data-for-tests/blog-data-for-tests";
import {blogsTestManager} from "../utils/blogsTestManager";

dotenv.config()

const uri = process.env.MONGO_URI
if (!uri) {
    throw new Error(' ! uri error ! ')
}


const getRequest = () => {
    return request(app)
}
describe(RouterPaths.blogs, () => {
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


    //get empty array
    it('should return empty array', async () => {
        const createResponse = await getRequest()
            .get(RouterPaths.blogs)
            .expect(200);

        expect(createResponse.body).toEqual(BlogPaginationView);
    })
    it('should create new blog', async () => {
        const createResponce01 = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createResponce01.body.id
        const createResponce02 = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(createResponce02.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createResponce01.body.createdAt,
            isMembership: false
        })
    })
    it(`shouldn't create blog with empty name`, async () => {
        await getRequest()
            .delete(RouterPaths.testing)
            .expect(204)
        const data = {
            ...dataTestBlogCreate01,
            name: incorrectInputData.emptyName
        }
        await blogsTestManager.createBlog(data, 400)

        const createResponce = await request(app)
            .get(RouterPaths.blogs)
            .expect(200)
        expect(createResponce.body.items).toStrictEqual([])
    })
    it(`shouldn't create blog with name more than 15 characters`, async () => {
        await getRequest()
            .delete(RouterPaths.testing)
            .expect(204)

        const data = {
            ...dataTestBlogCreate01,
            name: incorrectInputData.tooLongName
        }
        await blogsTestManager.createBlog(data, 400)

        const createResponse = await request(app)
            .get(RouterPaths.blogs)
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it(`shouldn't create blog with empty description`, async () => {

        const data = {
            ...dataTestBlogCreate01,
            description: incorrectInputData.emptyDescription
        }
        await blogsTestManager.createBlog(data, 400)

        const createResponse = await request(app)
            .get(RouterPaths.blogs)
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it('should return 404 for not existing blogs', async () => {
        await getRequest()
            .get(`${RouterPaths.blogs}/1`)
            .expect(404)
    })
    it(`shouldn't create blogs with description more than 500 symbols`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            description: incorrectInputData.tooLongDescription
        }
        await blogsTestManager.createBlog(data, 400)

        const createResponse = await request(app)
            .get(RouterPaths.blogs)
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it(`shouldn't create blogs with webditeUrl more than 100 suymbols`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            websiteUrl: incorrectInputData.tooLongWebsiteUrl
        }
        await blogsTestManager.createBlog(data, 400)

        const createResponse = await request(app)
            .get(RouterPaths.blogs)
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it(`shouldn't create blogs with websiteUrl that does not match the pattern`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            websiteUrl: incorrectInputData.incorrectWebsiteUrl
        }
        await blogsTestManager.createBlog(data, 400)

        const createResponse = await request(app)
            .get(RouterPaths.blogs)
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it('should return unaouthorized, 401', async () => {
        await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic op')
            .send(dataTestBlogCreate01)
            .expect(401)
    })
})