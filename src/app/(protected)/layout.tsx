import Navbar from "../components/Navbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string;
  email: string;
  name: string;
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let userDetails = {
    email: "",
    name: "",
    userId: "",
  };

  if (session?.user && "token" in session.user) {
    const decoded = jwtDecode<DecodedToken>(
      (session.user as { token: string }).token
    );
    userDetails = {
      email: decoded.email,
      name: decoded.name,
      userId: decoded.id,
    };
  }

  if (!userDetails.email) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={userDetails} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
