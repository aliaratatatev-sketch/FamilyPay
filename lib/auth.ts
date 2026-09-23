import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.username,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('✅ SignIn callback triggered');
      console.log('User:', user?.email);
      console.log('Account provider:', account?.provider);
      // Разрешаем вход
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback triggered');
      console.log('URL:', url);
      console.log('BaseURL:', baseUrl);
      
      // После успешного входа перенаправляем на dashboard
      if (url.startsWith('/')) {
        console.log('Redirecting to:', `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      else if (new URL(url).origin === baseUrl) {
        console.log('Redirecting to:', url);
        return url;
      }
      console.log('Redirecting to dashboard:', `${baseUrl}/dashboard`);
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token, user }) {
      console.log('📝 Session callback triggered');
      if (session.user) {
        session.user.id = token.sub || user?.id || '';
        
        // Получаем роль из БД
        if (session.user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
          });
          
          if (dbUser) {
            session.user.role = dbUser.role;
            console.log('User role:', dbUser.role);
          }
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('🔑 JWT callback triggered');
      if (user) {
        token.sub = user.id;
        console.log('User ID:', user.id);
      }
      
      // Добавляем роль в токен при входе
      if (account && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          console.log('Token role set:', dbUser.role);
        }
      }
      
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
