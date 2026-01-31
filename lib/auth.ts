import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Developer Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "dev@example.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email;

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        // If not, create user
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
            },
          });
        }

        return {
           id: user.id,
           email: user.email,
           name: user.name,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.sub;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
       if (user) {
          token.sub = user.id;
       }
       return token;
    }
  },
};
