
import Project from "./Projects";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  let userId = "";
  const session = await getServerSession(authOptions);
  userId=session?.user.id
  return (
    <><Project userId={userId}/></>
    
  );
}