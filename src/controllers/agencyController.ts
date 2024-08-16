import { Response, Request } from "express";
import { log } from "console";
import { Agency, IAgency, Post } from "../models/model.js";


// ? : Get All Agencies ( optional limit query )
export const getAllAgencies = async (req: Request, res: Response) => {

    const { limit } = req.query;

    try {

        const agencies = await Agency.find().limit(limit ? Number(limit) : 20);
        log(`Agencies : ${agencies}`)
        return res.status(200).json({
            message: "success",
            data: agencies,
            status: 200
        })

    } catch (error) {
        log(`Error : ${error}`);
        return res.status(500).send({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }

}

// ? : Find Agency With User Id
export const getAgencyWithUserId = async (req: Request, res: Response) => {
    log(`param : ${JSON.stringify(req.params)}`)

    const { user_id } = req.params;

    try {
        const agencies: IAgency[] | null = await Agency.find({ user_id: user_id }).populate('user_id');

        log(`agency : ${agencies}`)

        if (!agencies) {
            return res.status(404).send({
                message: "Agency not found",
                status: 404
            });
        }
        return res.status(200).send({
            message: "success",
            data: agencies
        });
    } catch (error) {
        res.status(500).send({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }
};


// ? : Find Posts of a Agency
export const getPostByAgencyId = async (req: Request, res: Response) => {

    const { agency_id } = req.params;

    if (!agency_id) {
        return res.status(400).json({
            error: "error",
            message: `Invalid User Id ${agency_id}`,
        })
    }
    try {

        const populateAgency = {
            path: "agency",
            populate: {
                path: "user_id",

            }
        }

        const posts = await Post.find({ agency: agency_id }).populate(populateAgency).sort({ createdAt: -1 }).limit(10);

        log(`posts : ${posts}`)

        return res.status(200).send({
            message: "success",
            data: posts
        })

    } catch (error) {
        return res.status(500).json({
            error: "error",
            message: `Internal Server Error ${error}`,
        })
    }
}