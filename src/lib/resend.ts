import {Resend} from 'resend'
import env from 'dotenv'
env.config()

export const resend = new Resend(process.env.RESEND_API_KEY);