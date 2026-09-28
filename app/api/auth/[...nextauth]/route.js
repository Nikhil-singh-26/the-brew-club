import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDb from "@/db/connectDb";
import User from "@/models/User";

const reservedUsernames = [
  "dashboard",
  "profile",
  "login",
  "join",
  "about",
  "api",
  "admin",
  "user",
  "terms",
  "privacy",
  "explore",
  "home",
  "creators",
  "favicon.ico",
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }

        const rawEmail = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const rawPassword = typeof credentials.password === "string" ? credentials.password : "";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!rawEmail || !emailRegex.test(rawEmail)) {
          throw new Error("Please enter a valid email address.");
        }

        if (!rawPassword) {
          throw new Error("Please enter your password.");
        }

        await connectDb();

        const user = await User.findOne({ email: rawEmail });

        if (!user) {
          // Avoid account enumeration
          throw new Error("Invalid email or password.");
        }

        if (!user.password) {
          // User registered via OAuth without a password
          throw new Error("This account was registered with Google or GitHub. Please sign in with your provider.");
        }

        const isValid = await bcrypt.compare(rawPassword, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "credentials") {
          return true;
        }

        const userEmail = (user?.email || profile?.email || "").toLowerCase().trim();
        if (!userEmail) {
          return false;
        }

        await connectDb();

        const currentUser = await User.findOne({ email: userEmail });

        if (!currentUser) {
          let baseUsername = userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
          if (!baseUsername || baseUsername.length < 2) {
            baseUsername = "user";
          }

          let finalUsername = baseUsername;
          let counter = 1;
          while (
            reservedUsernames.includes(finalUsername) ||
            (await User.findOne({ username: finalUsername }))
          ) {
            finalUsername = `${baseUsername}${counter}`;
            counter++;
          }

          await User.create({
            email: userEmail,
            name: user.name || baseUsername,
            username: finalUsername,
            password: "",
            profilepic: "",
            coverpic: "",
            bio: "",
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

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      try {
        const userEmail = session?.user?.email || token?.email;
        if (userEmail) {
          await connectDb();
          const dbUser = await User.findOne({ email: userEmail });
          if (dbUser) {
            session.user.name = dbUser.username;
            session.user.username = dbUser.username;
            session.user.displayName = dbUser.name || dbUser.username;
            session.user.profilepic = dbUser.profilepic || "";
            session.user.image = dbUser.profilepic || "";
            session.user.email = dbUser.email;
            session.user.role = dbUser.role || "user";
            session.user.id = dbUser._id.toString();
          } else {
            session.user.profilepic = "";
            session.user.image = "";
            session.user.role = "user";
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
