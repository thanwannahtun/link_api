import { Request, Response } from "express";

import { Agency, IPost, Like, Post, ILike, Comment, IComment } from "../models/model.js";
import { log } from "console";


// ? : create a new post
export const insertPost = async (req: Request, res: Response) => {

    const { agency } = req.body as IPost;

    const agencyExisted = await Agency.findById(agency);

    log(`body : ${JSON.stringify(req.body)}`);


    log(`agencyExisted : ${agencyExisted}`)

    if (!agencyExisted) {
        return res.status(400).send({
            error: "error",
            message: `Agency with the ID not found! (${agency})`
        })
    }


    const post: IPost = new Post(req.body);
    try {
        const savedpost = await post.save();

        log(`savedpost ${JSON.stringify(savedpost)}`);

        const populateMidpoint = {
            path: "midpoints", populate: {
                path: "city", select: "_id name"
            },
            options: {
                sort: { order: -1 } // Sort by order field
            }
        };

        const response = await Post.findOne({ _id: savedpost._id }).populate(["agency", "origin", "destination", "comments", "likes"]).populate(populateMidpoint)

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


}


export const getPosts = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const posts = await Post.find()
            .populate('agency', ['name', 'profile_image', 'user_id'])
            .populate('origin')
            .populate('destination')
            .populate('seats')
            .populate('midpoints')
            .populate('comments')
            .populate('likes')
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        log(`posts : ${posts.map(post => JSON.stringify(post))}`)

        res.json(posts.map(post => ({
            routeId: post._id,
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
            description: post.description
        })));
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

// ? : Find Post of a User
export const getPostByUserId = async (req: Request, res: Response) => {

    // const { user_id } = req.params;

    // if(!user_id){
    //     return res.status(400).json({
    //         error:"error",
    //         message: `Invalid User Id ${user_id}`,
    //     })
    // }
    // try {
        
    //     const posts = await Post.find()
    // } catch (error) {
    //     return res.status(500).json({
    //         error:"error",
    //         message: `Internal Server Error ${error}`,
    //     })
    // }
}



// ? : [likes] update likeCounts of a post ( like || unlike )

export const likePost = async (req: Request, res: Response) => {

    const { user_id, post_id } = req.params;

    if (!user_id || !post_id) {
        return res.status(400).json({
            error: "error",
            message: "Bad Request!",
        })
        
    }

    const existingLike = await Like.findOne({ post: post_id, user: user_id });

    if (existingLike) {
        // return res.status(400).send({
        //     error: "error",
        //     message: "User has already liked this post."
        // });
        await Post.findByIdAndDelete(post_id, {
            $inc: { likeCounts: -1 },
            $pull: { likes: existingLike._id }
        });
        return res.json({
            message: "success",
        })
    }

    const like : ILike = new Like({user:user_id,post:post_id});
    const newLike = await like.save();

    log(`newLike : ${newLike} `)

   try {
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
            data: post.likes
        });
    } catch (error) {
        return res.status(500).send({
            error: "error",
            status: 500,
            message: `Error ${error}`
        });
    }
};

// ? Endpoint to add a comment

export const addComment = async (req: Request, res: Response) => {

    const { user_id, post_id } = req.params;

    const { content } = req.body as IComment;

    const postExisted = await Post.findById(post_id);

    if(!postExisted){
        return res.status(404).json({
            error: "error",
            message: `Post id ${post_id} Not Found!`,
        })
    }

    if (!user_id || !post_id || !content) {
        return res.status(400).json({
            error: "error",
            message: "Bad Request!",
        })
    }

    try {
        const comment = new Comment({user:user_id,post:post_id,content});

       await comment.save();

       await Post.findByIdAndUpdate(post_id,{
        $inc:{commentCounts:1},
        $push:{comments:comment._id}
       })

        log(`comment : ${comment}`)

        return res.status(200).send({
            message: "success",
            status: 200,
            data: comment
        });

    } catch (error) {

        return res.status(500).json({
            error: "error",
            message: `Internal Server Error! ${error}`,
        })
    }

}

// ? Endpoint to update a comment

export const updateComment = async (req: Request, res: Response) => {
    
    // const { comment_id , post_id , user_id }  = req.params;

    // const { contentToUpdate } = req.body;

    // if(!contentToUpdate){
    //     return res.status(400).json({
    //         message: `Bad Request! Required Field Missing`,
    //         error:"error"
    //     });
    // }

    // if(!comment_id || !post_id || !user_id){
    //     return res.status(400).json({
    //         message: `Bad Request! Required Field(s) Missing `,
    //         error:"error"
    //     });
    // }

    // const updatedComment = await Comment.findByIdAndUpdate(comment_id,)

}

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