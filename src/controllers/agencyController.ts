import { Response, Request } from "express";
import { log } from "console";
import { Agency } from "../models/model.js";


export const getAllAgencies = async (req: Request, res: Response) => {
    try {
        const agencies = await Agency.find();
        log(`Agencies : ${agencies}`)
        return res.status(200).send(agencies)
    } catch (error) {
        log(`Error : ${error}`);
        return res.status(500).send({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }
    
}

export const getAgencyWithUser = async (req:Request, res:Response) => {
    log(`param : ${JSON.stringify(req.params)}`)
    try {
        const agency = await Agency.findById(req.params.user_id).populate('user_id');
        if (!agency) {
            return res.status(404).send({
                message: "Agency not found",
                status: 404
            });
        }
        res.status(200).send(agency);
    } catch (error) {
        res.status(500).send({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }
};