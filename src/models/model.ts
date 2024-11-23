import mongoose, { Document, Schema, Types } from 'mongoose';
export interface IVerificationCode extends Document {
    code: string;
    email: string;
    expiredAt: Date;
}

const verificationCodeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

export const VerificationCode = mongoose.model<IVerificationCode>('VerificationCode', verificationCodeSchema);


export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

export const User = mongoose.model<IUser>('User', userSchema);

export interface IAgency extends Document {
    user_id: Types.ObjectId, // reference to User
    name: string,
    profile_description?: string,
    location?: {
        lat: number,
        lon: number
    },
    profile_image?: string,
    email: string,
    password: string,
    logo: string
}

const AgencySchema: Schema = new Schema<IAgency>({
    name: { type: String, required: true },
    profile_description: { type: String, required: true },
    profile_image: { type: String, required: true },
    location: { type: Map, required: true },
    logo: { type: String, },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const Agency = mongoose.model<IAgency>('Agency', AgencySchema);

export interface ICountry extends Document {
    name: string
}

const CountrySchema: Schema = new Schema<ICountry>({
    name: { type: String, required: true }
})

export const Country = mongoose.model<ICountry>('Country', CountrySchema);

export interface ICity extends Document {
    name: string;
    country: Types.ObjectId;
}

const CitySchema: Schema = new Schema<ICity>({
    name: { type: String, required: true },
    country: { type: Schema.Types.ObjectId, ref: "Country", required: true }
});

export const City = mongoose.model<ICity>('City', CitySchema);

export interface ISeat extends Document {
    number: string;
    type: string;
    status: string;
}

const SeatSchema: Schema = new Schema<ISeat>({
    number: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ["available", "booked"], default: "available" }
});

export const Seat = mongoose.model<ISeat>('Seat', SeatSchema);


export interface IMidPoint extends Document {
    city: mongoose.Types.ObjectId,
    // arrivalTime: Date;
    // departureTime: Date;
    averageDrivingtime: Date,
    description: string,
    price: number
}

const MidPointSchema: Schema = new Schema<IMidPoint>({
    city: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    // arrivalTime: { type: Date },
    averageDrivingtime: { type: Date },
    // departureTime: { type: Date },
    description: { type: String },
    price: { type: Number }
});

export const MidPoint = mongoose.model<IMidPoint>('MidPoint', MidPointSchema);


export interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const CommentSchema: Schema = new Schema<IComment>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);


export interface ILike extends Document {
    post: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LikeSchema: Schema = new Schema<ILike>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    createdAt: { type: Date, default: Date.now }
});

export const Like = mongoose.model<ILike>('Like', LikeSchema);

export interface IRoute extends Document {
    agency: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    origin: mongoose.Types.ObjectId;
    destination: mongoose.Types.ObjectId;
    scheduleDate: Date;
    pricePerTraveller: number;
    midpoints: IMidPoint[];
    image: string | null;
    description: string;
    createdAt: Date;
    seats: mongoose.Types.ObjectId[];
}

const RouteSchma: Schema = new Schema<IRoute>({
    agency: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    origin: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    destination: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    scheduleDate: { type: Date, required: true },
    pricePerTraveller: { type: Number, required: true },
    midpoints: [MidPointSchema],
    createdAt: { type: Date, default: Date.now },
    seats: [SeatSchema],
    description: { type: String },
    image: { type: String }
});

export const Route = mongoose.model<IRoute>('Route', RouteSchma);


// midpoints: mongoose.Types.ObjectId[];
// midpoints: IMidPoint[];

export interface IPost extends Document {
    agency: mongoose.Types.ObjectId;
    commentCounts: number;
    likeCounts: number;
    shareCounts: number;
    comments: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    title: string;
    description: string;
    createdAt: Date;
    images: string[]; // Add this line for images
    /// For [Route]
    routes: mongoose.Types.ObjectId[],
}

// seats: [{ type: Schema.Types.ObjectId, ref: 'Seat' }],
const PostSchema: Schema = new Schema<IPost>({
    agency: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    commentCounts: { type: Number, default: 0 },
    likeCounts: { type: Number, default: 0 },
    shareCounts: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    images: [{ type: String }], // Add this line
    /// For [Route]
    routes: [{ type: Schema.Types.ObjectId, ref: 'Route' }]
});

export const Post = mongoose.model<IPost>('Post', PostSchema);

export interface IRouteHistory extends Document {
    origin: mongoose.Types.ObjectId;
    destination: mongoose.Types.ObjectId;
    date: Date;
    createdAt: Date;
    // filter: string[];
}

const RouteHistorySchema: Schema = new Schema<IRouteHistory>({
    origin: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    destination: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    date: { type: Date },
    createdAt: { type: Date, default: Date.now },
    // filter: [{ type: String, enum: ["VIP", "Business", "High Class", ""] }]
    // filter:"VIP" || "Business" || "Normal" ,
});

export const RouteHistory = mongoose.model<IRouteHistory>('RouteHistory', RouteHistorySchema);