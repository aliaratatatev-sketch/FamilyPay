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
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
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
      
      // Если это вход через Google
      if (account?.provider === 'google') {
        if (!user.email) {
          console.log('❌ Нет email от Google');
          return false;
        }
        
        console.log('✅ Разрешаем вход через Google для:', user.email);
        // PrismaAdapter автоматически создаст пользователя и account в БД
        return true;
      }
      
      // Для других методов входа (credentials) разрешаем
      console.log('✅ Разрешаем вход через credentials');
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback triggered');
      console.log('URL:', url);
      console.log('BaseURL:', baseUrl);
      
      // Всегда используем baseUrl, который NextAuth определяет автоматически
      // На Vercel это будет правильный URL продакшена
      console.log('Using baseUrl:', baseUrl);
      
      // Если URL относительный (начинается с /)
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log('Redirecting to relative path:', redirectUrl);
        return redirectUrl;
      }
      
      // Если URL абсолютный и соответствует baseUrl
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        if (urlObj.origin === baseUrlObj.origin) {
          console.log('Redirecting to same origin:', url);
          return url;
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
      
      // По умолчанию перенаправляем на dashboard
      const dashboardUrl = `${baseUrl}/dashboard`;
      console.log('Redirecting to default dashboard:', dashboardUrl);
      return dashboardUrl;
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
    error: '/login', // Перенаправляем ошибки на страницу входа
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
