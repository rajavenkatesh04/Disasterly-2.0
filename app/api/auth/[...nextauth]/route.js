import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/User";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("Sign-in callback for:", user.email);
            try {
                await dbConnect();
                const existingUser = await User.findOne({ email: user.email });
                if (existingUser) {
                    console.log("Updating existing user");
                    await User.findOneAndUpdate(
                        { email: user.email },
                        { lastLogin: new Date() },
                        { new: true }
                    );
                } else {
                    console.log("Creating new user");
                    await User.create({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        isProfileComplete: false,
                        createdAt: new Date(),
                    });
                }
                return true;
            } catch (error) {
                console.error("Sign-in error:", error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                console.log("JWT callback for:", user.email);
                await dbConnect();
                const dbUser = await User.findOne({ email: user.email });
                if (dbUser) {
                    token.isProfileComplete = dbUser.isProfileComplete;
                    token.userId = dbUser.userId || dbUser._id.toString(); // Use userId if exists, fallback to _id
                    token.name = dbUser.name;
                    token.email = dbUser.email; // Ensure email is in token
                    token.image = dbUser.image;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                console.log("Session callback for:", session.user.email);
                session.user.isProfileComplete = token.isProfileComplete;
                session.user.userId = token.userId; // Use userId instead of id
                session.user.name = token.name;
                session.user.email = token.email; // Ensure email is in session
                session.user.image = token.image;
            }
            return session;
        },
    },
    pages: {
        signIn: "/signin",
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };