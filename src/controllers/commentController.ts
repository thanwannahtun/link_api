import { log } from "console";
import { Comment, IComment, Post } from "../models/model.js";
import { Request, Response } from "express";

// ? Endpoint to add a comment

export const addComment = async (req: Request, res: Response) => {

    const { user_id, post_id } = req.params;

    const { content } = req.body as IComment;

    const postExisted = await Post.findById(post_id);

    if (!postExisted) {
        return res.status(404).json({
            error: "error",
            message: `Post id ${post_id} Not Found!`,
        })
    }

    if (!user_id || !post_id || !content) {
        return res.status(400).json({
            error: "error",
            message: "Required Fields are missing!",
        });
    }

    try {
        const comment = new Comment({ user: user_id, post: post_id, content });

        await comment.save();

        await Post.findByIdAndUpdate(post_id, {
            $inc: { commentCounts: 1 },
            $push: { comments: comment._id }
        })

        log(`comment : ${comment}`)

        return res.status(200).send({
            message: "success",
            status: 200,
            data: [comment]
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

    const { post_id, user_id, comment_id } = req.params;

    const { content : contentToUpdate } = req.body;

    try {

        if (!contentToUpdate) {
            return res.status(400).json({
                message: `Bad Request! Required Field Missing`,
                error: "error"
            });
        }

        if (!comment_id || !post_id || !user_id) {
            return res.status(400).json({
                message: `Bad Request! Required Field(s) Missing `,
                error: "error"
            });
        }

        // Update the comment
        const updatedComment = await Comment.findByIdAndUpdate(
            comment_id,
            { content: contentToUpdate },
            { new: true } // Return the updated document
        );

        // Check if the comment was found and updated

        if (!updatedComment) {
            return res.status(404).json({
                message: `Comment not found!`,
                error: "error"
            });
        }

        // Optionally, update the post's comments if needed

        await Post.findByIdAndUpdate(post_id, {
            $set: { comments: updatedComment._id }
        });

        return res.status(200).json({
            message: "Comment updated successfully!",
            data: updatedComment
        });

    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error}`,
            error: "error",
            status: 500
        });
    }

}



// ? Find Comments By post ID

export const getCommentsByPostId = async (req: Request, res: Response) => {

    const { post_id } = req.params;

    if (!post_id) {
        return res.status(400).json({
            message: `Bad Request! Required Field Missing`,
            error: "error"
        });

    }

    try {

        const populateUser = {
            path: "user",
            select:"name email"
        }

        const comments = await Comment.find({ post: post_id }).populate(populateUser);

        log(`comments : ${comments}`)

        return res.status(200).send({
            message: `success`,
            data: comments
        })

    } catch (error) {

        return res.status(400).json({
            message: `Server Error (${error})`,
            error: "error"
        });

    }
}
