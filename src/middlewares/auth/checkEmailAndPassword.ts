import { NextFunction, Request, Response } from "express";

interface IEmailAndPassword {
    email: String,
    password: String
}


export const checkEmailAndPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as IEmailAndPassword;

    let response = {
        error: "error",
        status: 400
    }
    if (!password && !email) {
        return res.status(400).send({ ...response, message: "Email and Password are required!" })
    }

    if (!email) {
        return res.status(400).send({ ...response, message: "Email is required!" })
    }
    if (!password) {
        return res.status(400).send({ ...response, message: "Password is required!" })
    }

    next();
}