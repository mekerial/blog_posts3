import request from 'supertest'
import {app} from "../../src";
import {RouterPaths} from "../../src/routes/router-paths";
import {dataTestBlogCreate01, dataTestBlogCreate02, incorrectInputData} from "../data-for-tests/blog-data-for-tests";
import {blogsTestManager} from "../utils/blogsTestManager";
import {CreateBlogModel} from "../../src/models/blogs/input";


const getRequest = () => {
    return request(app)
}
describe(RouterPaths.blogs, () => {
    beforeAll(async () => {
        getRequest().delete(RouterPaths.testing)
    })
    beforeEach(async () => {
        getRequest().delete(RouterPaths.testing)
    })


    //get empty array
    it('should return empty array', async () => {
        await getRequest()
            .get(RouterPaths.blogs)
            .expect(200, [])

    })
    it('shouldreturn 404 for not existing blogs', async () => {
        await getRequest()
            .get(`${RouterPaths.blogs}/1`)
            .expect(404)
    })
    //unauthorized
    it('should return unaouthorized, 401', async () => {
        await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic op')
            .send(dataTestBlogCreate01)
            .expect(401)
    })
    it(`shouldn't create vlog with empty name`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            name: incorrectInputData.emptyName
        }
        await blogsTestManager.createBlog(data, 400)

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [])
    })

    it(`shouldn't create blog with name more than 15 characters`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            name: incorrectInputData.tooLongName
        }
        await blogsTestManager.createBlog(data, 400)

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [])
    })

    it(`shouldn't create blog with empty description`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            description: incorrectInputData.emptyDescription
        }
        await blogsTestManager.createBlog(data, 400)

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [])
    })

    it (`shouldn't create blogs with description more than 500 symbols`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            description: incorrectInputData.tooLongDescription
        }
        await blogsTestManager.createBlog(data, 400)

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [])
    })

    it(`shouldn't create blogs with empty websiteUrl`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            websiteUrl: incorrectInputData.emptyWebsiteUrl
        }
        await blogsTestManager.createBlog(data, 400)

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [])
    })

    it(`shouldn't create blogs with webditeUrl more than 100 suymbols`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            websiteUrl: incorrectInputData.tooLongWebsiteUrl
        }
        await blogsTestManager.createBlog(data, 400)

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [])
    })

    it(`shouldn't create blogs with websiteUrl that does not match the pattern`, async () => {
        const data = {
            ...dataTestBlogCreate01,
            websiteUrl: incorrectInputData.incorrectWebsiteUrl
        }
        await blogsTestManager.createBlog(data, 400)

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200,[])
    })


    let createdNewBlog01: any = null
    it(`should create blog with correct input data`, async () => {

        const result = await blogsTestManager.createBlog(dataTestBlogCreate01)

        createdNewBlog01 = result.createdEntity;

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [createdNewBlog01])
    })

    let createdNewBlog02:any = null
    it(`created one more blogs`, async () => {

        const data: CreateBlogModel = dataTestBlogCreate02

        const result = await blogsTestManager.createBlog(data)

        createdNewBlog02 = result.createdEntity;

        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [createdNewBlog01, createdNewBlog02])
    })




    it('should create blog', async () => {

        await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                name: 'valid name',
                description: 'valid description',
                websiteUrl: 'https://www.google.com'
            })
            .expect(201)
    })

})