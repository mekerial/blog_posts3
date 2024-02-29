import {Request, Response, Router} from "express";
import nodemailer from 'nodemailer'
import dotenv from "dotenv";
import {emailAdapter} from "../../adapters/email/email-adapter";
dotenv.config()
export const emailRoute = Router({})

emailRoute.post('/send', async (req: Request, res: Response) => {

    await emailAdapter.sendEmail(req.body.email, req.body.subject, req.body.message)

})