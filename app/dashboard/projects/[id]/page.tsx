import { connection } from "next/server"
import { ProjectDetail } from "./project-detail"

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params
  return <ProjectDetail id={id} />
}
