import {CreateBlogModel, UpdateBlogModel} from "../../src/models/blogs/input";
import {app} from "../../src";
import request from "supertest";
import {RouterPaths} from "../../src/routes/router-paths";


export const blogsTestManager = {
    async createBlog(data: CreateBlogModel,
                     expectedStatusCode = 201) {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(data)
            .expect(expectedStatusCode)

        let createdEntity;
        if (expectedStatusCode === 201) {
            createdEntity = response.body;
            expect(createdEntity).toEqual({
                ...createdEntity,
                id: expect.any(String),
                name: data.name,
                description: data.description,
                websiteUrl: data.websiteUrl
            })
        }
        return {response: response, createdEntity: createdEntity};
    },

    async updateBlog(id: string,
                     data: UpdateBlogModel,
                     expectedStatusCode: number) {
        const response = await request(app)
            .put(`${RouterPaths.blogs}/${id}`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === 204) {
            await request(app)
                .get(`${RouterPaths.blogs}/${id}`)
                .expect(200, {
                    id: id,
                    name: data.name,
                    description: data.description,
                    websiteUrl: data.websiteUrl
                })
        }
        return {response: response}
    }
}