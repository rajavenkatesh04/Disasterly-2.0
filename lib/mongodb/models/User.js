import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    gender: { type: String },
    dateOfBirth: { type: Date },
    phone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    // Add the userId field to the schema
    userId: { type: String, unique: true, sparse: true },
    isProfileComplete: { type: Boolean, default: false },
    profileUpdatedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Virtual property for age calculation
UserSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

// Ensure virtual fields are included when converting to JSON
UserSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;