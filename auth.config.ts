import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";
// import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        console.log('Start');
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        });

        console.log('step 1');

        const { email, password } = schema.parse(credentials);

        const user = await prisma.user.findUnique({
          where: { email },
        });
        console.log('step 2');

        if (!user) throw new Error('No user found');
        console.log('step 3');

        if (!user.password) throw new Error('No password set for user');
        const valid = await bcrypt.compare(password, user.password);
        console.log('step 4');

        if (!valid) throw new Error('Invalid password');

        console.log('DONE');

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User;
    }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (token && session.user) {
        session.user.role = token.role; 
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
