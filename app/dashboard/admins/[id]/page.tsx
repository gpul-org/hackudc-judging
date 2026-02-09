import { connection } from "next/server"
import { AdminDetail } from "./admin-detail"

export default async function AdminDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params
  return <AdminDetail id={id} />
}
