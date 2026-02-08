import { connection } from "next/server"
import { ParticipantDetail } from "./participant-detail"

export default async function ParticipantDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params
  return <ParticipantDetail id={id} />
}
