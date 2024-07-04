import request from "supertest";
import {app} from "../../src/settings";
import {RouterPaths} from "../../src/routes/router-paths";



const getRequest = () => {
    return request(app)
}

describe(RouterPaths.security.devices, () => {
    beforeAll(async () => {
        getRequest().delete(RouterPaths.testing)
    })
    beforeEach(async () => {
        getRequest().delete(RouterPaths.testing)
    })

    it('should return empty array', async () => {

        await getRequest()
            .post(RouterPaths.security.devices)
            .expect(204)

    })



})