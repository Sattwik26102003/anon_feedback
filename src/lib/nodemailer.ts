import nodemailer from 'nodemailer'
import env from 'dotenv'
env.config()
export const transporter = nodemailer.createTransport({
    service: 'gmail', // Change this if using another provider
    auth: {
      user: process.env.EMAIL, // Your email
      pass: process.env.PASSWORD, // App password (not your actual password)
    },
  });