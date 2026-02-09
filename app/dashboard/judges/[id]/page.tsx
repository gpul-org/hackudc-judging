import { connection } from "next/server"
import { JudgeDetail } from "./judge-detail"

export default async function JudgeDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params
  return <JudgeDetail id={id} />
}
