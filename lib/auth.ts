import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[AUTH] Missing credentials');
            return null;
          }

          const { prisma } = await import('@/lib/prisma');
          const bcrypt = await import('bcryptjs');

          console.log('[AUTH] Looking for user:', credentials.email);
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user) {
            console.log('[AUTH] User not found');
            return null;
          }

          console.log('[AUTH] User found, checking password');
          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!passwordMatch) {
            console.log('[AUTH] Password mismatch');
            return null;
          }

          console.log('[AUTH] Password match, returning user object');
          const userObject = {
            id: user.id,
            email: user.email,
            name: user.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            role: user.role as any,
          };
          console.log('[AUTH] User object:', JSON.stringify(userObject));
          return userObject;
        } catch (error) {
          console.error('[AUTH] Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
});
