import { Response, Request } from "express";
import { log } from "console";
import { Agency, IAgency } from "../models/model.js";

async function checkAgency(email: String): Promise<IAgency | null> {
    log("check")
    return await Agency.findOne<IAgency>({ email: email });
}


export const signUpAgency = async (req: Request, res: Response) => {
    log(`body : ${JSON.stringify(req.body)}`);

    const { email } = req.body as IAgency;

    // validation
    const existed = await checkAgency(email);

    log(`checkAgency: ${existed}`);

    if (existed != null) {
        return res.status(400).send({
            message: `${email} already exists! Please log in again`,
            error: "error",
            status: 400
        });
    }

    const agency = new Agency(req.body);
    log(`agency : ${JSON.stringify(agency)}`);

    try {
        const savedAgency = await agency.save();
        log(`savedAgency ${JSON.stringify(savedAgency)}`);

        return res.status(201).send({
            message: "success",
            status: 201,
            data: [savedAgency]
        });
    } catch (error) {
        log(`Error: ${error}`);
        return res.status(500).send({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }
}

export const signInAgency = async (req: Request, res: Response) => {

    const { email, password } = req.body as IAgency;

    /// validation
    const agency = await checkAgency(email);
    if (agency === null) {
        return res.status(404).send({
            message: `${email} Not Found!`,
            error: "error",
            status: 404
        })
    }

    // compare password 


    try {

        res.status(200).send({
            message: "success",
            status: 200,
            data: [agency]
        })

    } catch (error) {
        res.status(500).send({
            error: "error",
            status: 500,
            message: "Internal Server Error!"
        })
    }
}

export const signOutAgency = async (req: Request, res: Response) => {

    const { email } = req.body as IAgency;

    const agency = await checkAgency(email);

    if (agency === null) {
        return res.status(404).send({
            message: `${email} Not Found!`,
            error: "error",
            status: 404
        })
    }

    try {

        const { deletedCount } = await Agency.deleteOne({ email: email });
        if (deletedCount <= 0) {
            return res.status(400).send({
                message: `Failed to SignOut`,
                error: "error",
                status: 400
            })
        }
        res.status(200).send({
            message: `See You Next Time!`,
            error: "success",
            status: 404
        })

    } catch (error) {
        res.status(500).send({
            message: `Failed to SignOut ( Error )`,
            error: "error",
            status: 500
        })
    }

}