import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
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
            profilepic: "",
            coverpic: "",
            razorpayid: "",
            razorpaysecret: "",
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
            session.user.image = dbUser.profilepic || "";
          } else {
            session.user.profilepic = "";
            session.user.image = "";
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
