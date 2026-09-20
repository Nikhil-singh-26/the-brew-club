import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile - The Brew Club",
};

export default function ProfilePage() {
  redirect("/dashboard");
}
