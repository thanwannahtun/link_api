
/*

Used .toObject() to convert Mongoose documents to plain JavaScript objects for manipulation.

*/


/*
Overriding _id Fields in Models (Schemas):

Option 1: Use toObject with Custom Transformation
postSchema.set('toObject', {
    transform: (doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    }
});


Option 2: Override toJSON Method

Schema Transformation:
postSchema.set('toJSON', {
    transform: (doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    }
});


*/