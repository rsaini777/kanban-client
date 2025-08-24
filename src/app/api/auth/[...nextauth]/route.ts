import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          const user = res.data;
          if (user) return user;
          return null;
        } catch (err: any) {
          console.error("Login error:", err.response?.data || err.message);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // Redirect to your auth page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.token = user.token; // store backend JWT if you have one
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      

      try {
       const res =await axios.get(`${API_BASE_URL}/auth/user/${token.id}`, {
          headers: {
            Authorization: `Bearer ${token.token}`,
          },
        });
        

        if (session.user) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.token = token.token;
        }

        return session;
      } catch (error: any) {
        if (error.response?.status === 401) {
          return null;
        }
        console.error("Session Error:", error.message);
        return session;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
