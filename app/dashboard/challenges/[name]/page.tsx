import { connection } from "next/server"
import { ChallengeDetail } from "./challenge-detail"

export default async function ChallengeDetailPage({
  params
}: {
  params: Promise<{ name: string }>
}) {
  await connection()
  const { name } = await params
  return <ChallengeDetail name={decodeURIComponent(name)} />
}
