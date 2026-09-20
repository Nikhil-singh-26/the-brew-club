import React from "react";
import PaymentPage from "@/components/PaymentPage";
import { notFound } from "next/navigation";
import connectDb from "@/db/connectDb";
import User from "@/models/User";

const Username = async ({ params }) => {
  const resolvedParams = await params;
  const username = resolvedParams?.username;

  if (!username) {
    return notFound();
  }

  await connectDb();
  const user = await User.findOne({ username }).lean();

  if (!user) {
    return notFound();
  }

  return <PaymentPage username={username} />;
};

export default Username;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username || "Creator";

  return {
    title: `Support @${username} - The Brew Club`,
    description: `Support @${username} on The Brew Club. Fuel their creative journey.`,
  };
}
