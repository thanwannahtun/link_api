import { Response, Request } from "express";
import { log } from "console";
import { Agency, IAgency, Post } from "../models/model.js";
import { GetPostParam } from "./postController.js";

interface GetAgencyQuery { agency_id?: string, limit?: number, sort?: {} }
/// const limit: number = parseInt((req.query.limit ?? 10) as string);

interface GetAgencyParam extends GetPostParam, GetAgencyQuery { }
export const getAgencyByQuery = async (req: Request, res: Response) => {
    const { agency_id, limit, sort } = req.query as GetAgencyQuery;
    log(`Request Query::: ${JSON.stringify(req.query)}`);

    const populateUser = {
        path: "user_id",
        select: "name email password",
    }

    try {
        let agencies: IAgency[] = [];
        if (agency_id) {
            // ? : url?agency_id=123
            agencies = await getAgencyId({ agency_id, populate: populateUser });
        } else {
            log("HEllo");

            // ? : url?limit=n&?sort=%7B%22createdAt%22%3A-1%7D&limit=6 ... etc
            agencies = await getAllAgencies({ populate: populateUser, limit, sort: sort });
        }
        return res.send({
            status: 200,
            data: agencies,
            message: `success`
        });

    } catch (error) {

        res.status(500).send({
            error: "error",
            status: 500,
            message: `Internal Server Error!`
        });
    }

    async function getAllAgencies(param: GetAgencyParam): Promise<IAgency[]> {
        return getByParam(param);
    }

    async function getAgencyId(param: GetAgencyParam): Promise<IAgency[]> {
        return getByParam(param);
    }

    async function getByParam(param: GetAgencyParam): Promise<IAgency[]> {
        log(`getByParam ::: ${JSON.stringify(param)}`)
        const page: number = parseInt(req.query.page as string, 10) || 1;
        const limit: number = parseInt(req.query.limit as string, 10) || 10;
        const skip: number = (page - 1) * limit;
        try {
            if (param.agency_id) {
                log("Agencyl");

                const agency = await Agency.findById(param.agency_id).populate(populateUser);
                if (agency?.id === null) {
                    throw Error(`Agency not Found!`);
                }
                return [agency] as IAgency[];
            } else {
                log("HEllo");

                const agencies = await Agency.find({/* filter here */ })
                    .populate(param.populate ?? "")
                    .sort(param.sort)
                    .skip(skip ?? 0)
                    .limit(limit)
                    .exec();
                return agencies as IAgency[];
            }
        } catch (error) {
            throw new Error((error as Error).message);
        }
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