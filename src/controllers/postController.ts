import { Request, Response } from "express";


import { IPost, Like, Post, ILike, RouteHistory, Route, IRoute } from "../models/model.js";
import { log } from "console";

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose, { PopulateOptions, Types } from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface AggregatedRoute {
    _id: {
        origin: mongoose.Types.ObjectId;
        destination: mongoose.Types.ObjectId;
        date: Date;
    };
    count: number; // the number of searches for this route
}

// <Populate>

const populateRoute = {
    path: 'routes',
    populate: [
        { path: 'agency' }, // Populates the agency
        { path: 'origin' }, // Populates the origin city
        { path: 'destination' }, // Populates the destination city
        {
            path: 'midpoints.city', // Populates the city field inside each midpoint
        }
    ]
};

const populateAgency = {
    path: "agency",
    select: ['name', 'profile_image', 'user_id'],
    populate: {
        path: 'user_id',
        select:"name email password"
    }
}
const populateComment = {
    path: "comments",
    populate: {
        path: "user",
        select:"name email"
    }
};
const populateLike = {
    path: "likes",
    populate: {
        path: "user",
        select :"name email"
    }
}
const populateMidpoints = {
    path: "midpoints",
    populate: {
        path: "city",
    }
}


const populateArray = [
    populateAgency, populateComment , populateLike , populateMidpoints , "origin", "destination"
];
// </Populate>

/*
export const insertPost = async (req: Request, res: Response) => {
    const { agency } = req.body as IPost;
    
    log(`agency ${agency}`);
    log(`request body ::: ${JSON.stringify(req.body)}`);
    

  
    const agencyExisted = await Agency.findById(agency);

    log(`agencyExisted : ${agencyExisted}`);
  
    if (!agencyExisted) {
      return res.status(400).send({
        error: "error",
        message: `Agency with the ID not found! (${agency})`
      });
    }
  
    try {
    //   const post: IPost = new Post(req.body);
      const post: IPost = await Post.create(req.body);
        log(`created post : ${post}`)
      // Save initial post
        const savedPost = await post.save();
        
        log(`post saved ::: ${savedPost}`);
  
      if (!savedPost._id) {
        log(`Error: saved post does not have an _id`);
        return res.status(500).send({
          error: "error",
          status: 500,
          message: "Failed to save post. No _id was generated."
        });
      }
  
      // Handle image compression in worker threads
        const imagePaths = (req.files as Express.Multer.File[]).map(file => file.path);
        log(`imagePaths : [before compressed] : ${imagePaths}`);
        const compressedImagePaths: string[] = [];
        log(`dirname ${__dirname}`);
        
      const compressionPromises = imagePaths.map(imagePath => {
        return new Promise((resolve, reject) => {
            const outputFilePath = imagePath.replace('uploads/', 'uploads/compressed-');
            log(` outputFilePath ${outputFilePath}`)
            
          const worker = new Worker(path.join(__dirname, '../workers/imageWorker.ts'), {
            workerData: { inputFilePath: imagePath, outputFilePath }
          });
            
            log(`worker ::: ${worker.threadId}`);
  
            worker.on('message', (message) => {
            log(` on message ${message}`)
              
            if (message.error) {
              reject(new Error(message.error));
            } else {
                compressedImagePaths.push(outputFilePath);
              resolve(message.success);
            }
          });
  
            worker.on('error', (error) => {
            log(` on error ${error}`)
            reject(error);
          });
  
            worker.on('exit', (code) => {
            log(`on exit ${code}`)
              
            if (code !== 0) {
              reject(new Error(`Worker exited with code ${code}`));
            }
          });
        });
      });
  
        await Promise.all(compressionPromises).then((v)=> {
            log(`values primise ${v}`)
        }, (e) => {
            log(`error promise ${e}`)
            
        });
        log(`imagePaths : ${imagePaths}: [after compressed] :`);
        log(`compressedImagePaths legth ::: ${compressedImagePaths.length}`)
        // Optional: Delete original uncompressed images
        imagePaths.forEach(imagePath => {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    log(`Failed to delete original image: ${imagePath}, Error: ${err.message}`);
                }
                log(`deted images path :: ${imagePath}`);
    });
        });
        
        log(`imagePaths : [before unlinked] : ${imagePaths}`);

  
  
      // Optional: Update the post with the paths of the compressed images
      post.images = compressedImagePaths; // Adjust accordingly
        await post.save();
        
        log(`post.images : [after saved] : ${post.images}`);
        const populateAgency = {
            path: "agency",
            select: ['name', 'profile_image', 'user_id'],
            populate: {
                path: 'user_id',
                select:"name email password"
            }
        }
  
      const populateMidpoint = {
        path: "midpoints",
        populate: {
          path: "city",
          select: "_id name"
        },
        options: {
          sort: { order: -1 }
        }
      };
  
      const response = await Post.findOne({ _id: savedPost._id })
        .populate([populateAgency, "origin", "destination", "comments", "likes"])
          .populate(populateMidpoint)
        
          ;
  
      log(`response ${JSON.stringify(response)}`);
      log(`response : JSON.stringify : ${response}`);
  
      return res.status(201).send({
        message: "success",
        status: 201,
        data: [response]
      });
    } catch (error) {
      log(`Error: ${error}`);
      return res.status(500).send({
        error: "error",
        status: 500,
        message: `Error ${error}`
      });
    }
  };
*/
/* ---------------------------------------------------- */
/*
// ? : create a new post
export const insertPostMe = async (req: Request, res: Response) => {

    const { agency , midpoints } = req.body as IPost;
    const agencyExisted = await Agency.findById(agency);

    log(`agencyExisted : ${agencyExisted?.id}`)

    if (!agencyExisted) {
        return res.status(400).send({
            error: "error",
            message: `Agency with the ID not found! (${agency})`
        })
    }


    try {
        const post: IPost = new Post(req.body);

        // const images = (req.files as Express.Multer.File[])?.map((file: Express.Multer.File) => file.path);
        // const baseUrl = `${req.protocol}://${req.get('host')}`; // e.g., http://localhost:3000
        const images = (req.files as Express.Multer.File[]).map(file => `/uploads/${path.basename(file.path)}`);
        
        post.images = images;
        log(`images ::: ${images.map(i => i)}`)
        const savedpost = await post.save();

        log(`savedpost ${savedpost}`);

        if (!savedpost._id) {
            log(`Error: saved post does not have an _id`);
            return res.status(500).send({
                error: "error",
                status: 500,
                message: "Failed to save post. No _id was generated."
            });
        }

        const populateAgency = {
            path: "agency",
            select: ['name', 'profile_image', 'user_id'],
            populate: {
                path: 'user_id',
            }
        }
    

        const populateMidpoint = {
            path: "midpoints", populate: {
                path: "city",
                // select: "_id name"
            },
            options: {
                sort: { order: -1 } // Sort by order field
            }
        };

        // * find the inserted post and return the response
   
        const response = await Post.findOne({ _id: savedpost._id }).populate([populateAgency,populateMidpoint, "origin", "destination", "comments", "likes"])
        log(`response ${response}`);
        return res.status(201).send({
            message: "success",
            status: 201,
            data: [response]
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
*/
interface GetPostQuery  {
    categoryType?: "trending" | "sponsored" | "suggested" | "filter_searched_routes" | "trending_routes" | "post_with_routes";
    agency_id?: string,
    limit?: number,
    page?: number,
    post_id?:string
}
 export interface GetPostParam {
    limit?: number;
    populate: PopulateOptions | (string | PopulateOptions)[];
    sort?: {}, 
     page?: number,
     filter?:{}
}

// <uploadPost >
export const uploadNewPost = async (req: Request, res: Response) => {
    const { agency, title, description } = req.body as IPost;
    
    const { routes }: { routes: IRoute[] } = req.body;
    try {

        const post: IPost = new Post({ title, description, agency });
        try {

            if (req.files) {
                // const files = (req.files as Express.Multer.File[]).map(file => `/uploads/${path.basename(file.path)}`);
                const files = (req.files as Express.Multer.File[]);
                let fileIndex = 0;
                
                routes.forEach((route) => {
                    if (fileIndex < files.length && files[fileIndex]) {
                        route.image = `/uploads/${path.basename(files[fileIndex].path)}`;
                        fileIndex++;
                    } else {
                        route.image = null;
                    }
                })
                
                // post.images = images;
            }

            const routeIds: Types.ObjectId[] = [];
                for (const route of routes) {
                    const savedRoute = new Route({...route, post:post.id});
                    await savedRoute.save();
                    log(savedRoute.toJSON());
                    routeIds.push(savedRoute._id as Types.ObjectId);
                }
        log(`routeIds :: ${routeIds.length}`);
            // Add image paths to the post
       
        post.routes = routeIds; // add post routes ids
        const savedpost = await post.save();
        if (!savedpost._id) {
            /// throw Error
            throw Error(`Post did not save ! ${savedpost.id}`)
            }
            log(post.toJSON());
            
            res.send({
                message: "success",
                data:post
            })
            
        } catch (error) {
            throw Error(`eRRor :: ${error}`)
        }
       
    } catch (error) {
        return  res.status(500).json({
            error:"error",
            message: `Internal Error ${error}`,
        })
    }
}
// </uploadPost>
// </getPost>
export const getPostRoutesByCategory = async (req: Request, res: Response) => {

    const { categoryType, agency_id , limit , page , post_id } = req.query as GetPostQuery;
    const routeHistory = req.body as GET_ROUTE_REQUEST_BODY;

    log(`GetPostQuery ::: ${JSON.stringify(req.query)}`)

    /// Filter
    const filter : any = {} ;
    if (routeHistory.origin ) {
        filter["origin"] = routeHistory.origin; // Assuming origin is of type ObjectId
    }
    if (routeHistory.destination) {
        filter["destination"] = routeHistory.destination; // Assuming destination is of type ObjectId
    }
    if (routeHistory.date) {
        filter["scheduleDate"] = {$gte:new Date(routeHistory.date)}; // Filtering by date
    }
    /// Filter Posts by AgencyId 
    if (agency_id) {
        filter["agency"] = agency_id; // Assuming destination is of type ObjectId
    }
   
try {
    let posts: IPost[] = [];
    // const limit: number = parseInt((req.query.limit ?? 10) as string);
    if (categoryType === "post_with_routes") {
        /// assign [post_id] for only one post for post detail endpoint
        const postId = post_id; 
        if (postId) {
            /// get post by post id for post detail endpoint
            const postById = await Post.findById(postId).populate([populateAgency, populateRoute]).exec()        
            posts.push(postById as IPost);
            log(`post_with_routes postById :::: ${posts.length}`)
        } else {
            /// get posts endpoint
            posts = await Post.find({})
            .populate([populateAgency,populateRoute])
            .sort({}).
                // .skip(skip ?? 0).limit(limit).
                exec();
            // get post by id and then populate by route ids
            log(`post_with_routes posts :::: ${posts.length}`)
        }
     
        return res.send({
            data: posts,
            message: "success",
            status: 200
        })
    } else if (categoryType === "trending_routes") {
    const routes: IRoute[] = await getRoutesByTrendingRoutesCategory({ populate: [populateAgency, "origin", "destination", populateMidpoints], filter: {}, limit, });
        return res.send({
            data: routes,
            message: "success",
            status: 200
        })
    } else
       
    if (categoryType === "sponsored") {
        // posts = await getSponsoredPosts();
                posts = await getSponsoredPost({populate : populateArray , sort : {"createdAt":-1} , limit});
    } else if (categoryType === "trending") {
        const aggregatedRoutes :AggregatedRoute[] = await getTrendingRoutes();
        log(`aggregatedRoutes => ${JSON.stringify(aggregatedRoutes)}`)
        // const routes = await findRoutesByTrendingData(aggregatedRoutes);
        // log(`routes ::: ${JSON.stringify(routes)}`)
        // const routes = await findRoutesByTrendingData(aggregatedRoutes);
        // const routeIds = await findRouteIdsByTrendingData(aggregatedRoutes);
        // log(`routeIds length ::: ${routeIds.length}`)
        // posts = await findPostsByRouteIds(routeIds, populateRoute);
        // log(`routes => ${JSON.stringify(routes)}`)

        posts = await findPostsByTrendingRoutes(aggregatedRoutes, { populate: [populateAgency, populateRoute], limit, page , sort:{"createdAt":-1} });
        log(`posts length => ${posts.length}`)
        
        return res.send({
            message: "success",
            data:posts,
        });
                // posts = await getTrendingPost({populate : populateArray , sort : {"createdAt":1} , limit});
    } else if (categoryType === "suggested") {
                posts = await getPostsByAsc({populate : populateArray , sort : {"scheduleDate":-1} , limit});
    } else if (categoryType === "filter_searched_routes") {
        try {
        const routes: IRoute[] = await getRoutesByTrendingRoutesCategory({
            populate: [populateAgency, "origin", "destination", populateMidpoints], filter, limit, });
        // const postsIds = await searchRoutes( filter );
        log(`filter_searched_routes routes :length: ${routes.length}`)
        await insertIntoRouteHistoryCollection(routeHistory);
        // posts = await findPostsByPostIds(postsIds, {populate:populateRoute , limit , sort : {} , page : parseInt(`${page}`)});
                // posts = await searchedRoutes({ populate: populateArray, sort: { "scheduleDate": -1 }, limit });
                // await insertIntoRouteHistoryCollection(routeHistory);
        // log(`filterSearchedRoutes ::: ${posts.length}`)
        return res.send({
            message: "success",
            data:routes,
        });
    } catch (error) {
        return res.send({
            message: `error : ${error}`,
            data:[],
        });
    }
    } else {
        posts = await queryRoutes({populate:populateArray,limit });
    }
            return res.send(
                {
                    status: 200,
                    message: "success",
                    data:posts
                }
            );
    } catch (error ) {
            res.status(500).send(
                {
                    error: "Internal Server Error", 
                    message:( error as Error).message,
                    data:[]
                }
            );
    }

    async function getSponsoredPost(param: GetPostParam) {
        return queryRoutes(param);
     }
     async function getTrendingPost(param: GetPostParam) {
        return queryRoutes(param);
     }
     async function getPostsByAsc(param: GetPostParam) {
         return queryRoutes(param);
     }
    async function searchedRoutes(param: GetPostParam) {
         return queryRoutes(param);
     }
 
     async function queryRoutes (param: GetPostParam): Promise<IPost[]> {
             log(`===============(( queryRoutes Param ::: ${JSON.stringify(param)}`);
         /// Pagination
         const page: number = parseInt(req.query.page as string, 10) || 1;
         const limit: number = parseInt(req.query.limit as string, 10) || 10;
         const skip: number = (page - 1) * limit;

         /// Pagination
        try {
             log(`Filter :::: ${JSON.stringify(filter)}`)
         // Fetch data with pagination
         const posts = await Post.find(filter)
         .populate(param.populate ?? "")
         .sort(param.sort)
         .skip(skip ?? 0)
         .limit(limit)
         .exec();
         
  
         const totalRecords = await Post.countDocuments();
         const totalPages = Math.ceil(totalRecords / limit);
         const pagination =  {currentPage: page, limit: limit, totalRecords,totalPages,};
      log(`pagination ::: ${JSON.stringify(pagination)}`)
             log(`pagination ::: ${JSON.stringify(pagination)}`)
             return posts as IPost[] ;
            } catch (error) {
                    throw new Error((error as Error).message);    
            }
        }
}
/// getRoutesByTrendingRoutesCategory
const getRoutesByTrendingRoutesCategory = async (param: GetPostParam): Promise<IRoute[]> => {
    try {
        
    
      /// Pagination
      const page: number = param.page || 1;  // Default to page 1, not 10
      const limit: number = param.limit || 10;
     const skip: number = (page - 1) * limit; 
 
     
     const totalRecords = await Route.countDocuments(); // Count only matching posts
     const totalPages = Math.ceil(totalRecords / limit);
     const pagination =  {currentPage: page, limit: limit, totalRecords,totalPages,};
     log(`pagination ::: ${JSON.stringify(pagination)}`)
    log(`filter_searched_routes filter ::: ${JSON.stringify(param.filter)}`)
    return await Route.find(param.filter ?? {})
        .populate(param.populate)
        .sort(param.sort)
            .skip(skip ?? 0).limit(limit).exec();
        } catch (error) {
            throw new Error(`Error at getRoutesByTrendingRoutesCategory :: ${error}`)
        }
}

// </getPost>

const findPostsByTrendingRoutes = async (
    trendingRoutes: AggregatedRoute[],
    param: GetPostParam
): Promise<IPost[]> => {
    try {
        // Step 1: Get routeIds from trending routes
        const routeIds: Types.ObjectId[] = await findRouteIdsByTrendingData(trendingRoutes);
        // Step 2: Use routeIds to find the corresponding postIds
        const routes = await Route.find({ _id: { $in: routeIds } }).select('post').lean();
        const postIds: Types.ObjectId[] = routes.map(route => route.post);
        log(`findPostsByTrendingRoutes (postIds) => ${postIds.length}`)
        // Step 3: Use postIds to find the posts
        const posts = await findPostsByPostIds(postIds, param);
        log(`findPostsByTrendingRoutes (posts) => ${JSON.stringify(posts.at(0))}`)

        return posts;
    } catch (error) {
        throw new Error(`Error finding posts by trending routes ( findPostsByTrendingRoutes ): ${error}`);
    }
};


async function insertIntoRouteHistoryCollection(routeHistory: ROUTE_HISTORY) {
    log(`
        insertIntoRouteHistoryCollection :::: ${routeHistory.origin}-${routeHistory.destination}-${routeHistory.date}
        `)
    if (routeHistory.origin !== null && routeHistory.destination !== null) {
        RouteHistory.create(routeHistory);
    }
}

/// TrendingRoutes

// Function to get trending routes based on search history
const getTrendingRoutes = async (): Promise<AggregatedRoute[]> => {
    try {
        // Aggregate trending routes by origin, destination, and date
        const trendingRoutes: AggregatedRoute[] = await RouteHistory.aggregate([
            {
                $group: {
                    _id: {
                        origin: "$origin",
                        destination: "$destination",
                        // date: "$date"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } } // Sort by highest search count
            ,
            { 
                $limit: 10 // Limit to top 10 trending routes
            }
        ]);

        return trendingRoutes;
    } catch (error) {
        throw new Error(`Error finding trending routes: ${error}`);
    }
};

// Function to find routes based on trending route info
const findRouteIdsByTrendingData = async (
    trendingRoutes: AggregatedRoute[]
): Promise<Types.ObjectId[]> => {
    try {

           // Sort by count descending (most popular routes first)
           const sortedRoutes = trendingRoutes.sort((a, b) => b.count - a.count);
        // Extract origin, destination, and date from the trending data
        const routeFilters = sortedRoutes.map(route => ({
            origin: route._id.origin,
            destination: route._id.destination,
            // scheduleDate: route._id.date
        }));

        // Find all matching route IDs
        const matchingRoutes = await Route.find({
            $or: routeFilters
        }).select('_id').lean(); // Select only '_id' and return as plain JS objects
        log(`findRouteIdsByTrendingData (matchingRoutes) => ${JSON.stringify(matchingRoutes)}`)

        // Extract and return the route IDs
        const routeIds: Types.ObjectId[] = matchingRoutes.map(route => route._id as Types.ObjectId);
        log(`findRouteIdsByTrendingData (routeIds) => ${routeIds.length}`)
        return routeIds;
    } catch (error) {
        throw new Error(`Error finding routes by trending data: ${error}`);
    }
};

const findRoutesByTrendingData = async (
    trendingRoutes: AggregatedRoute[]
): Promise<IRoute[]> => {
    try {
        // Extract origin, destination, and date from the trending data
        const routeFilters = trendingRoutes.map(route => ({
            origin: route._id.origin,
            destination: route._id.destination,
            scheduleDate: route._id.date
        }));

        // Find all matching routes in the Route collection
      const matchingRoutes: IRoute[] = await Route.find({
        $or: routeFilters
    }).populate('agency origin destination midpoints').lean();

        return matchingRoutes;
    } catch (error) {
        throw new Error(`Error finding routes by trending data: ${error}`);
    }
};

/// TrendingRoutes

const searchRoutes = async (filter: {}): Promise<Types.ObjectId[]> => {
    //param : GET_ROUTE_REQUEST_BODY 
    // log(`
    //     searchRoutes :::: )=> param : ${JSON.stringify(param)} , filter : ${JSON.stringify(filter)}
    //     `);
    // if (!param) {
    //     log(`
    //     Param missing ${param}
    //     `)
    // }
    try {
        const routes = await Route.find(filter);
        const postIds: Types.ObjectId[] = [];
        for (const route of routes) {
            postIds.push(route.post)
        }
        return postIds;
    } catch (error) {
        throw Error(`Error getting posts ids of searched routes => ${error}`)
    }
}



const findPostsByRouteIds = async (routeIds: Types.ObjectId[], param: GetPostParam): Promise<IPost[]> => {

    let posts: IPost[] = [];

    try {
        posts = await Post.find({ _id: { $in: routeIds } }).populate(param.populate ?? "")
        return posts;
    } catch (error) {
        throw Error(`Error finding posts by route_ids => ${error}`);
    }
}
const findPostsByPostIds = async (postIds: Types.ObjectId[], param: GetPostParam): Promise<IPost[]> => {
     /// Pagination
    const page: number = param.page || 1;  // Default to page 1, not 10
     const limit: number = param.limit || 10;
    const skip: number = (page - 1) * limit; 

    
    const totalRecords = await Post.countDocuments(); // Count only matching posts
    const totalPages = Math.ceil(totalRecords / limit);
    const pagination =  {currentPage: page, limit: limit, totalRecords,totalPages,};
    log(`pagination ::: ${JSON.stringify(pagination)}`)
    
    log(`findPostsByIds :::>> param : ${JSON.stringify(param)} , postIds length : ${postIds.length}`)
     /// Pagination
    try {
        // Ensure postIds array is not empty
           // Ensure postIds array is not empty
    if (postIds.length === 0) {
        log(`No postIds provided, returning empty array`);
        return [] as IPost[];
    }

        // Find posts whose _id matches any of the ids in the postIds array
        const posts = await Post.find({ _id: { $in: postIds } })
        .populate(param.populate ?? "")
        .sort(param.sort)
        .skip(skip ?? 0)
        .limit(limit)
            .exec();
        // Sort each post's routes by `pricePerTraveller`     
        return posts as IPost[];
        
    } catch (error) {
        throw Error(`Error finding posts by ids => ${error}`);
    }
};


/*
export const getPosts = async (req: Request, res: Response) => {
    try {
        const populateAgency = {
            path: "agency",
            select: ['name', 'profile_image', 'user_id'],
            populate: {
                path: 'user_id',
                select:"name email password"
            }
        }

        const populateComment = {
            path: "comments",
            populate: {
                path: "user",
                select:"name email"
            }
        };

        const populateLike = {
            path: "likes",
            populate: {
                path: "user",
                select :"name email"
            }
        }

        const populateMidpoints = {
            path: "midpoints",
            populate: {
                path: "city",
            }
        }

        const limit = parseInt(req.query.limit as string) || 10;
        const posts = await Post.find()
            .populate(populateAgency)
            .populate('origin')
            .populate('destination')
            .populate('seats')
            .populate(populateMidpoints)
            // .populate('comments')
            .populate(populateComment)
            .populate(populateLike)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        log(`posts : ${posts}}`)

        const postsJson = posts.map(post => ({
            _id: post._id,
            agency: post.agency,
            origin: post.origin,
            destination: post.destination,
            scheduleDate: post.scheduleDate,
            pricePerTraveler: post.pricePerTraveler,
            seats: post.seats,
            createdAt: post.createdAt,
            midpoints: post.midpoints,
            commentCounts: post.commentCounts,
            likeCounts: post.likeCounts,
            shareCounts: post.shareCounts,
            comments: post.comments,
            likes: post.likes,
            title: post.title,
            description: post.description,
            images:post.images
        }));
        return res.json({
            
            status: 200,
            message: "success",
            data:postsJson
        });

    } catch (error) {
        log(`Error: ${error}`);
        return res.status(500).json({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }
}
*/
interface ROUTE_HISTORY {
    origin: string,
    destination: string, 
    date: Date,
}

interface GET_ROUTE_REQUEST_BODY extends ROUTE_HISTORY {}

export const getPostByCategory = async (req: Request, res: Response) => {

    const { categoryType, agency_id , limit } = req.query as GetPostQuery;
    const routeHistory = req.body as GET_ROUTE_REQUEST_BODY;

    log(`GetPostQuery ::: ${JSON.stringify(req.query)}`)

    const populateAgency = {
        path: "agency",
        select: ['name', 'profile_image', 'user_id'],
        populate: {
            path: 'user_id',
            select:"name email password"
        }
    }
    const populateComment = {
        path: "comments",
        populate: {
            path: "user",
            select:"name email"
        }
    };
    const populateLike = {
        path: "likes",
        populate: {
            path: "user",
            select :"name email"
        }
    }
    const populateMidpoints = {
        path: "midpoints",
        populate: {
            path: "city",
        }
    }


    const populateArray = [
        populateAgency, populateComment , populateLike , populateMidpoints , "origin", "destination"
    ];

    // Constructing the filter object
    const filter : any = {} ;
    if (routeHistory.origin ) {
        filter["origin"] = routeHistory.origin; // Assuming origin is of type ObjectId
    }
    if (routeHistory.destination) {
        filter["destination"] = routeHistory.destination; // Assuming destination is of type ObjectId
    }
    if (routeHistory.date) {
        filter["scheduleDate"] = {$gte:new Date(routeHistory.date)}; // Filtering by date
    }
    /// Filter Posts by AgencyId 
    if (agency_id) {
        filter["agency"] = agency_id; // Assuming destination is of type ObjectId
    }

    
    async function insertIntoRouteHistoryCollection(routeHistory: ROUTE_HISTORY) {
        log(`insertIntoRouteHistoryCollection :::: ${routeHistory.origin}-${routeHistory.destination}-${routeHistory.date}`)
        if (routeHistory.origin !== null && routeHistory.destination !== null) {
            RouteHistory.create(routeHistory);
        }
    }

try {
    let posts: IPost[] = [];
    // const limit: number = parseInt((req.query.limit ?? 10) as string);
            if (categoryType === "sponsored") {
                posts = await getSponsoredPost({populate : populateArray , sort : {"createdAt":-1} , limit});
            } else if (categoryType === "trending") {
                posts = await getTrendingPost({populate : populateArray , sort : {"createdAt":1} , limit});
            } else if (categoryType === "suggested") {
                posts = await getPostsByAsc({populate : populateArray , sort : {"scheduleDate":-1} , limit});
            } else if (categoryType === "filter_searched_routes") {
                posts = await filterSearchedRoutes({ populate: populateArray, sort: { "scheduleDate": -1 }, limit });
                await insertIntoRouteHistoryCollection(routeHistory);
                log(`filterSearchedRoutes ::: ${posts.length}`)
            } else {
                posts = await queryRoutes({populate:populateArray,limit });
            }
            

    
            return res.send(
                {
                    status: 200,
                    message: "success",
                    data:posts
                }
            );
    } catch (error ) {
            res.status(500).send(
                {
                    error: "Internal Server Error", 
                    message:( error as Error).message,
                    data:[]
                }
            );
    }

    async function getSponsoredPost(param: GetPostParam) {
       return queryRoutes(param);
    }

    async function getTrendingPost(param: GetPostParam) {
       return queryRoutes(param);
    }

    async function getPostsByAsc(param: GetPostParam) {
        return queryRoutes(param);
    }
    async function filterSearchedRoutes(param: GetPostParam) {
        return queryRoutes(param);
    }



    

    async function queryRoutes (param: GetPostParam): Promise<IPost[]> {

            log(`===============(( queryRoutes Param ::: ${JSON.stringify(param)}`);
            
        /// Pagination

        const page: number = parseInt(req.query.page as string, 10) || 1;
        const limit: number = parseInt(req.query.limit as string, 10) || 10;
        const skip: number = (page - 1) * limit;

        
        try {
            log(`Filter :::: ${JSON.stringify(filter)}`)
        // Fetch data with pagination
        const posts = await Post.find(filter)
        .populate(param.populate ?? "")
        .sort(param.sort)
        .skip(skip ?? 0)
        .limit(limit)
        .exec();
        
        const totalRecords = await Post.countDocuments();
        const totalPages = Math.ceil(totalRecords / limit);
        
            const pagination =  {
                pagination: {
                  currentPage: page,
                //   pageSize: limit,
                  limit: limit,
                  totalRecords,
                  totalPages,
                },
              };
            log(`pagination ::: ${JSON.stringify(pagination.pagination)}`)
            
        /// Pagination
            /*
            const posts : IPost[] = await Post.find()
                .populate(param.populate)
                .skip(param.skip ?? 0)
            .limit(param.limit ?? 10)
            .sort(param.sort)
                .exec();
            */
            // Convert each post to a plain object and extract the desired fields
            // const postCollection: IPost[] = posts.map(post => post.toObject());
            /*const postCollection  = posts.map(post => ({
                _id: post._id,
                agency: post.agency,
                origin: post.origin,
                destination: post.destination,
                scheduleDate: post.scheduleDate,
                pricePerTraveler: post.pricePerTraveler,
                seats: post.seats,
                createdAt: post.createdAt,
                midpoints: post.midpoints,
                commentCounts: post.commentCounts,
                likeCounts: post.likeCounts,
                shareCounts: post.shareCounts,
                comments: post.comments,
                likes: post.likes,
                title: post.title,
                description: post.description,
                images:post.images
            }));*/
            // return postCollection as IPost[];
            return [] as IPost[] ;
        } catch (error) {
                throw new Error((error as Error).message);    
        }
    }

};

// ? : Find Single Post By Post _id

export const getPostById = async (req: Request, res: Response) => {
    const { post_id } = req.params;

    log(`param : ${post_id}`)
    if(!post_id){
        return res.status(400).json({
            error: "error",
            message: `Invalid User Id ${post_id}`,
        });
    }
    try {
        const post : IPost | null = await Post.findById(post_id).populate('likes').populate('midpoints').populate('comments');
        
        log(`post : ${post}`)

        if(!post){
            return res.status(404).json({
                message: `post ${post_id} not found!`,
                error:"error"
            })
        }

        return res.status(200).json({
            message: `success`,
            data:[post]
        })
    } catch (error) {
        return  res.status(500).json({
            error:"error",
            message: `Internal Error ${error}`,
        })
    }
}

// ? : Handler to toggle like on a post

export const likePost = async (req: Request, res: Response) => {

    const { user_id, post_id } = req.params;

    if (!user_id || !post_id) {
        return res.status(400).json({
            error: "error",
            message: "Bad Request!",
        })
        
    }
    try {

    const existingLike = await Like.findOne({ post: post_id, user: user_id });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        await Post.findByIdAndUpdate(post_id, {
            $inc: { likeCounts: -1 },
            $pull: { likes: existingLike._id }
        });
        return res.json({
            message: "success",
        })
    }

    const newLike : ILike = new Like({user:user_id,post:post_id});
    await newLike.save();

    log(`newLike : ${newLike} `)

    await Post.findByIdAndUpdate(post_id, {
        $inc: { likeCounts: 1 },
        $push: { likes: newLike._id }
    });
        
    return res.json({
        message: "success",
        data: newLike
    })

    } catch (error) {
        
    return res.status(500).json({
        error:"error",
        message: `Internal Server Error ${error}`,
    })
        
   }
    
  
}


export const UnlikePost = async (req: Request, res: Response) => {

    const { user_id, post_id } = req.params;

    if (!user_id || !post_id) {
        return res.status(400).json({
            error: "error",
            message: "Bad Request!",

            
        })
        
    }

    const existingLike = await Like.findOne({ post: post_id, user: user_id });

    if (!existingLike) {
        return res.status(400).send({
            error: "error",
            message: "User had not liked this post."
        });
    }

   try {
    await Post.findByIdAndDelete(post_id,{
        $inc : {likeCounts : -1},
        $pull : {likes : existingLike._id}
    })
   
    return res.json({
        message: "success",
    })

   } catch (error) {
    return res.status(500).json({
        error:"error",
        message: `Internal Server Error ${error}`,
    })
   }
    
  
}


// ? Endpoint to get users who liked a post

export const getLikesForPost = async (req: Request, res: Response) => {
    const { post_id } = req.params;

    try {
        // Find the post and populate the likes
        const post = await Post.findById(post_id)
            .populate({
                path: 'likes',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            });

        if (!post) {
            return res.status(404).send({
                error: "error",
                message: "Post not found."
            });
        }

        return res.status(200).send({
            message: "success",
            status: 200,
            data: [post]
        });
    } catch (error) {
        return res.status(500).send({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }
};


/// GET Routes
  /*
    try {
        const populateAgency = {
            path: "agency",
            select: ['name', 'profile_image', 'user_id'],
            populate: {
                path: 'user_id',
                select:"name email password"
            }
        }

        const populateComment = {
            path: "comments",
            populate: {
                path: "user",
                select:"name email"
            }
        };

        const populateLike = {
            path: "likes",
            populate: {
                path: "user",
                select :"name email"
            }
        }

        const populateMidpoints = {
            path: "midpoints",
            populate: {
                path: "city",
            }
        }

        const limit = parseInt(req.query.limit as string) || 15;
        const posts = await Post.find()
            .populate(populateAgency)
            .populate('origin')
            .populate('destination')
            .populate('seats')
            .populate(populateMidpoints)
            // .populate('comments')
            .populate(populateComment)
            .populate(populateLike)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        log(`posts : ${posts}}`)

        const postsJson = posts.map(post => ({
            _id: post._id,
            agency: post.agency,
            origin: post.origin,
            destination: post.destination,
            scheduleDate: post.scheduleDate,
            pricePerTraveler: post.pricePerTraveler,
            seats: post.seats,
            createdAt: post.createdAt,
            midpoints: post.midpoints,
            commentCounts: post.commentCounts,
            likeCounts: post.likeCounts,
            shareCounts: post.shareCounts,
            comments: post.comments,
            likes: post.likes,
            title: post.title,
            description: post.description,
            images:post.images
        }));
        return res.json({
            
            status: 200,
            message: "success",
            data:postsJson
        });

    } catch (error) {
        log(`Error: ${error}`);
        return res.status(500).json({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }
    */


//// [ changing _id to id for Mobile Json ]

// export const insertPostByRenaming_idToid = async (req: Request, res: Response) => {
//         const { agency } = req.body as IPost;
    
//         const agencyExisted = await Agency.findById(agency);
    
//         console.log(`body : ${JSON.stringify(req.body)}`);
    
//         console.log(`agencyExisted : ${agencyExisted}`);
    
//         if (!agencyExisted) {
//             return res.status(400).send({
//                 error: "error",
//                 message: `Agency with the ID not found! (${agency})`
//             });
//         }
    
//         const post = new Post(req.body);
//         try {
//             const savedPost = await post.save();
    
//             console.log(`savedPost ${JSON.stringify(savedPost)}`);
    
//             // Find the post with populated fields
//             const response = await Post.findOne({ _id: savedPost._id })
//                 .populate(["agency", "origin", "destination", "midpoints", "comments", "likes"]);
    
//             if (!response) {
//                 return res.status(404).send({
//                     error: "error",
//                     message: `Post not found! (${savedPost._id})`
//                 });
//             }
    
//             // Cast response to any type to use toObject()
//             const responseObj = response.toObject() as IPost & { [key: string]: any };
    
//             // Transform the response to use `id` instead of `_id`
//             const transformedResponse = {
//                 ...responseObj,
//                 id: responseObj._id.toString(),
//                 origin: responseObj.origin ? { ...responseObj.origin, id: responseObj.origin._id.toString() } : null,
//                 destination: responseObj.destination ? { ...responseObj.destination, id: responseObj.destination._id.toString() } : null,
//                 midpoints: responseObj.midpoints.map(midpoint => ({
//                     ...midpoint,
//                     id: midpoint._id.toString()
//                 })),
//                 comments: responseObj.comments.map(comment => ({
//                     ...comment,
//                     id: comment._id.toString()
//                 })),
//                 likes: responseObj.likes.map(like => ({
//                     ...like,
//                     id: like._id.toString()
//                 }))
//             };
    
//             delete transformedResponse._id;
//             if (transformedResponse.origin) delete transformedResponse.origin._id;
//             if (transformedResponse.destination) delete transformedResponse.destination._id;
//             transformedResponse.midpoints.forEach(midpoint => delete midpoint._id);
//             transformedResponse.comments.forEach(comment => delete comment._id);
//             transformedResponse.likes.forEach(like => delete like._id);
    
//             console.log(`transformedResponse ${JSON.stringify(transformedResponse)}`);
    
//             return res.status(201).send({
//                 message: "success",
//                 status: 201,
//                 data: [transformedResponse]
//             });
//         } catch (error) {
//             console.log(`Error: ${error}`);
//             return res.status(500).send({
//                 error: "error",
//                 status: 500,
//                 message: `Error ${error}`
//             });
//         }
//     };