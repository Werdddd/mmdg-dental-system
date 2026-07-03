import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getDocumentsInFolder, getFolderById } from '@/lib/data/documents'
import { FolderView } from '@/components/documents/folder-view'

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await params
  const supabase = await createClient()

  const [folder, documents, profile] = await Promise.all([
    getFolderById(supabase, folderId),
    getDocumentsInFolder(supabase, folderId),
    getCurrentProfile(),
  ])

  if (!folder) notFound()

  const canManage = profile?.role === 'superadmin' || profile?.role === 'admin'

  return (
    <FolderView folder={folder} documents={documents} canManage={canManage} />
  )
}
