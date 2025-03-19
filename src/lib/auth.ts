import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const AUTH_USERS: { id: string; username: string; password: string }[] =
          process.env.AUTH_USERS ? JSON.parse(process.env.AUTH_USERS) : [];

        const user = AUTH_USERS.find(
          (user) =>
            user.username === credentials.username &&
            user.password === credentials.password
        );

        if (user) {
          return { id: user.id, name: user.username };
        } else {
          throw new Error("Invalid username or password");
        }
      },
    }),
  ],
});
