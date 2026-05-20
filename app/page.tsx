import { db } from "@/lib/db";

export default async function Page() {
  const department = await db.query.session.findMany();
  console.log(department);
  return null;
}