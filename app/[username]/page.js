import React from "react";
import PaymentPage from "@/components/PaymentPage";
import { notFound } from "next/navigation";
import { fetchuser, fetchpayments } from "@/actions/useractions";

const UsernamePage = async ({ params }) => {
  const resolvedParams = await params;
  const username = resolvedParams?.username;

  if (!username) {
    return notFound();
  }

  const user = await fetchuser(username);
  if (!user) {
    return notFound();
  }

  const payments = await fetchpayments(username);

  return (
    <PaymentPage
      username={username}
      initialUser={user}
      initialPayments={payments || []}
    />
  );
};

export default UsernamePage;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username || "Creator";

  const user = await fetchuser(username);
  const displayName = user?.name || username;
  const bio =
    user?.bio ||
    `Support @${username} on The Brew Club. Fuel their creative journey.`;

  return {
    title: `${displayName} (@${username}) - The Brew Club`,
    description: bio,
  };
}
