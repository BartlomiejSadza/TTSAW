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
          return null;
        }

        // Dynamic import to avoid Edge Runtime issues
        const { getDb } = await import('./db');
        const bcrypt = await import('bcrypt');

        const db = await getDb();
        const result = db.exec(
          `SELECT * FROM users WHERE email = ?`,
          [credentials.email as string]
        );

        if (result.length === 0 || result[0].values.length === 0) {
          return null;
        }

        const row = result[0].values[0];
        const user = {
          id: row[0] as string,
          email: row[1] as string,
          name: row[2] as string,
          password: row[3] as string,
          role: row[4] as 'USER' | 'ADMIN',
          createdAt: row[5] as string,
        };

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
});
