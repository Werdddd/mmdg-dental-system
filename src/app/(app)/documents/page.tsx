import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getDocumentFolders } from '@/lib/data/documents'
import { DocumentsView } from '@/components/documents/documents-view'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const [folders, profile] = await Promise.all([
    getDocumentFolders(supabase),
    getCurrentProfile(),
  ])
  const canManage = profile?.role === 'superadmin' || profile?.role === 'admin'

  return <DocumentsView folders={folders} canManage={canManage} />
}
