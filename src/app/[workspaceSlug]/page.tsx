import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function WorkspaceRootPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  redirect(`/${workspaceSlug}/dashboard`)
}
