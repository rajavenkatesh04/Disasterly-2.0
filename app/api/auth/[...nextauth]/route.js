// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/app/utils/mongoClient";
import User from "@/lib/mongodb/models/User";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            console.log("Sign-in callback started for user:", user.email);
            try {
                await dbConnect();
                console.log("MongoDB connected in signIn callback");

                // Check if the user already exists
                const existingUser = await User.findOne({ email: user.email });

                if (existingUser) {
                    console.log("Updating existing user:", user.email);
                    await User.findOneAndUpdate(
                        { email: user.email },
                        {
                            name: user.name || existingUser.name,
                            image: user.image || existingUser.image,
                            lastLogin: new Date()
                        },
                        { new: true }
                    );
                } else {
                    console.log("Creating new user:", user.email);
                    await User.create({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        isProfileComplete: false,
                        createdAt: new Date(),
                        lastLogin: new Date()
                    });
                }
                console.log("Sign-in callback completed successfully");
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
        async jwt({ token, user, account, trigger, session }) {
            try {
                // Connect to DB
                await dbConnect();

                // If this is a sign-in event or a session update
                if (trigger === "signIn" || trigger === "update") {
                    console.log("JWT callback: Refreshing user data for:", token.email);

                    const dbUser = await User.findOne({ email: token.email });
                    if (dbUser) {
                        console.log("User found in database, isProfileComplete:", dbUser.isProfileComplete);

                        // Update the token with the latest user data
                        token.isProfileComplete = dbUser.isProfileComplete || false;
                        token.userId = dbUser._id.toString();
                        token.name = dbUser.name;
                        token.picture = dbUser.image;

                        // Add role if you implement it later
                        if (dbUser.role) {
                            token.role = dbUser.role;
                        }
                    } else {
                        console.log("User not found in database");
                        token.isProfileComplete = false;
                    }
                }

                // For session updates, check if we need to update profile completion status
                if (trigger === "update" && session?.isProfileComplete !== undefined) {
                    console.log("Updating profile completion status in token");
                    token.isProfileComplete = session.isProfileComplete;

                    // Update the database too
                    await User.findOneAndUpdate(
                        { email: token.email },
                        { isProfileComplete: session.isProfileComplete }
                    );
                }
            } catch (error) {
                console.error("Error in jwt callback:", error);
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                console.log("Adding user data to session for:", session.user.email);

                // Add user data from token to session
                session.user.isProfileComplete = token.isProfileComplete || false;
                session.user.id = token.userId;

                // Make sure name and image are synced
                session.user.name = token.name || session.user.name;
                session.user.image = token.picture || session.user.image;

                // Add role if present
                if (token.role) {
                    session.user.role = token.role;
                }
            }
            return session;
        }
    },
    pages: {
        // Custom pages - helps middleware redirects work better
        signIn: '/api/auth/signin',
        error: '/api/auth/error',
        // You can add signOut and others if needed
    },
    events: {
        // Track important auth events
        async signIn({ user }) {
            console.log(`User signed in: ${user.email}`);
        },
        async createUser({ user }) {
            console.log(`New user created: ${user.email}`);
        },
        async linkAccount({ user }) {
            console.log(`Account linked for user: ${user.email}`);
        },
        async session({ session }) {
            console.log(`Session accessed for: ${session.user.email}`);
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === "development",
};

// Create the handler functions for GET and POST requests
const handler = NextAuth(authOptions);

// Export the GET and POST functions for API routes in App Router
export const GET = handler;
export const POST = handler;