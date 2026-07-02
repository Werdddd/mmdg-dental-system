import type { SignatureValue } from '@/lib/dental/signature'

interface SignaturePreviewProps {
  label: string
  signature: SignatureValue | null
  printedName?: string
  date?: string
}

export function SignaturePreview({
  label,
  signature,
  printedName,
  date,
}: SignaturePreviewProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex h-16 items-center rounded-lg border border-dashed bg-white px-3">
        {signature?.type === 'drawn' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signature.data}
            alt={`${label} signature`}
            className="h-full object-contain"
          />
        ) : signature?.type === 'typed' ? (
          <p
            className="text-xl text-slate-800"
            style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
          >
            {signature.data}
          </p>
        ) : (
          <span className="text-sm text-muted-foreground">Not signed</span>
        )}
      </div>
      {(printedName || date) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {printedName && <span>{printedName}</span>}
          {printedName && date && <span> · </span>}
          {date && <span>{date}</span>}
        </p>
      )}
    </div>
  )
}
