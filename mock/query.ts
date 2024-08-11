
// import { Request, Response } from 'express';
// import { Post } from './model';

// export const getPosts = async (req: Request, res: Response) => {
//     try {
//         const limit = parseInt(req.query.limit as string) || 20;
//         const posts = await Post.find()
//             .populate('agency')
//             .populate('origin')
//             .populate('destination')
//             .populate('seats')
//             .populate('midpoints')
//             .populate('comments')
//             .populate('likes')
//             .limit(limit)
//             .sort({ createdAt: -1 })
//             .exec();

//         res.json(posts.map(post => ({
//             routeId: post._id,
//             agency: post.agency,
//             origin: post.origin,
//             destination: post.destination,
//             scheduleDate: post.scheduleDate,
//             pricePerTraveler: post.pricePerTraveler,
//             seats: post.seats,
//             createdAt: post.createdAt,
//             midpoints: post.midpoints,
//             commentCounts: post.commentCounts,
//             likeCounts: post.likeCounts,
//             shareCounts: post.shareCounts,
//             comments: post.comments,
//             likes: post.likes,
//             title: post.title,
//             description: post.description
//         })));
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
