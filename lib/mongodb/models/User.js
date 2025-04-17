import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    // Basic user information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    gender: { type: String },
    dateOfBirth: { type: Date },
    age: { type: Number },

    // Contact information
    phone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },

    // System fields
    userId: { type: String, unique: true, sparse: true },
    isProfileComplete: { type: Boolean, default: false },
    profileUpdatedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },

    // RBAC fields
    role: {
        type: String,
        enum: ['user', 'admin', 'personnel_manager', 'support'],
        default: 'user'
    },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
});

// Ensure fields are included when converting to JSON
UserSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;