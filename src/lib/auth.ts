import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        console.log(credentials);

        if (username === "criticalfuture" && password === "password") {
          return { id: "1", name: "criticalfuture", username };
        }
        throw new Error("Invalid credentials.");
      },
    }),
  ],
});
