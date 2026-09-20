import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedinProvider from "next-auth/providers/linkedin";
import GitHubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import connectDb from "@/db/connectDb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    LinkedinProvider({
      clientId: process.env.LINKEDIN_ID || "",
      clientSecret: process.env.LINKEDIN_SECRET || "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID || "",
      clientSecret: process.env.TWITTER_SECRET || "",
      version: "2.0",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const userEmail = user?.email || profile?.email;
        if (!userEmail) {
          return false;
        }

        await connectDb();

        const currentUser = await User.findOne({ email: userEmail });

        if (!currentUser) {
          let baseUsername = userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
          if (!baseUsername) {
            baseUsername = "user";
          }

          let finalUsername = baseUsername;
          let counter = 1;
          while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${baseUsername}${counter}`;
            counter++;
          }

          await User.create({
            email: userEmail,
            name: user.name || baseUsername,
            username: finalUsername,
            profilepic: user.image || "",
          });
        }
        return true;
      } catch (error) {
        console.error("Error in NextAuth signIn callback:", error);
        return false;
      }
    },

    async session({ session }) {
      try {
        if (session?.user?.email) {
          await connectDb();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.name = dbUser.username;
            session.user.username = dbUser.username;
            session.user.displayName = dbUser.name || dbUser.username;
            session.user.profilepic = dbUser.profilepic || "";
          }
        }
      } catch (error) {
        console.error("Error in NextAuth session callback:", error);
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
