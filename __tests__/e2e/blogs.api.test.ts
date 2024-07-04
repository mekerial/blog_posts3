import request from "supertest";
import {app} from "../../src/settings";
import {RouterPaths} from "../../src/routes/router-paths";



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

    it('get blogs', async () => {

        await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                name: 'valid name',
                description: 'valid description',
                websiteUrl: 'https://www.google.com'
            })
            .expect(204)
    })
})