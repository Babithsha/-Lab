
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
                try {
                    await dbConnect();
                } catch (e) {
                    console.error('DB connection failed during auth:', e);
                    throw new Error('Database connection failed. Please try again later.');
                }
                const email = credentials?.email?.trim().toLowerCase();
                const password = credentials?.password;

                if (!email || !password) return null;

                try {
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
                } catch (e) {
                    console.error('User lookup failed:', e);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                await dbConnect();
                if (account?.provider === "google") {
                    const email = user.email?.trim().toLowerCase();
                    if (email) {
                        const existingUser = await User.findOne({ email: email as string });
                        if (!existingUser) {
                            await User.create({
                                name: user.name ?? 'Google User',
                                email: email,
                                role: "student",
                                password: "",
                                image: user.image ?? ''
                            });
                        }
                    }
                }
            } catch (e) {
                console.error('SignIn callback DB error:', e);
            }
            return true;
        },
        async jwt({ token, user }) {
            if (token.email) {
                try {
                    await dbConnect();
                    const dbUser = await User.findOne({ email: (token.email as string).trim().toLowerCase() });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser._id.toString();
                    }
                } catch (e) {
                    console.error('JWT callback DB error:', e);
                    // Keep existing token data on DB failure
                }
            }

            if (user) {
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
