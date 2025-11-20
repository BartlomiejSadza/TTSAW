import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        const { prisma } = await import('@/lib/prisma');
        const bcrypt = await import('bcrypt');

        console.log('Attempting login for:', credentials.email);

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          console.log('User not found:', credentials.email);
          return null;
        }

        console.log('User found:', user.email, 'ID:', user.id);
        console.log('Password hash preview:', user.password.substring(0, 20));

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
          console.log('Password mismatch for user:', credentials.email);
          return null;
        }

        console.log('Login successful for:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: user.role as any,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
});
