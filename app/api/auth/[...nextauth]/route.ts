
import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/db"
import { User } from "@/lib/models"

declare module "next-auth" {
    interface Session {
        user: {
            role?: string;
        } & DefaultSession["user"]
    }
    interface User {
        role?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();
                const email = credentials?.email?.trim().toLowerCase();
                const password = credentials?.password;

                if (!email || !password) return null;

                // Check DB
                const user = await User.findOne({ email });
                if (user && user.password === password) {
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            await dbConnect();
            if (account?.provider === "google") {
                // Allow any email for now, or uncomment to restrict
                // if (!profile?.email?.endsWith("@klu.ac.in")) {
                //    return false; // Reject
                // }

                // Auto-register user if not exists
                const email = user.email?.trim().toLowerCase();
                if (email) {
                    const existingUser = await User.findOne({ email: email as string });
                    if (!existingUser) {
                        await User.create({
                            name: user.name,
                            email: email,
                            role: "student", // Default role for Google Sign-in
                            password: "", // No password for OAuth
                            image: user.image
                        });
                    }
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user }) {
            // Initial sign in or subsequent requests - Sync role from DB
            if (token.email) {
                await dbConnect();
                const dbUser = await User.findOne({ email: (token.email as string).trim().toLowerCase() });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                }
            }

            if (user) {
                // Fallback if DB lookup failed or for Credentials provider initial pass
                if (!token.role && user.role) {
                    token.role = user.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role as string;
                if (token.id) {
                    (session.user as any).id = token.id;
                }
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
