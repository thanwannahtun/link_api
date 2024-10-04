import { Request, Response } from "express";


import { Agency, IPost, Like, Post, ILike } from "../models/model.js";
import { log } from "console";
import fs from 'fs';

import { Worker } from 'worker_threads';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

/* ---------------------------------------------------- */

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

let count = 0;

export const getPosts = async (req: Request, res: Response) => {

    

    count++;
    log(`count ::: ${count}`);
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