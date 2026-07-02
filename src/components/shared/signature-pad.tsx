'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { PenLine, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { SignatureValue } from '@/lib/dental/signature'

export type { SignatureValue }

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 160

function DrawPad({
  initialDataUrl,
  onCapture,
}: {
  initialDataUrl?: string
  onCapture: (dataUrl: string | null) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  function getContext() {
    const canvas = canvasRef.current
    return canvas ? canvas.getContext('2d') : null
  }

  function pointFromEvent(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    const ctx = getContext()
    if (!ctx) return
    drawingRef.current = true
    const { x, y } = pointFromEvent(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const ctx = getContext()
    if (!ctx) return
    const { x, y } = pointFromEvent(e)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1f2937'
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasStrokes(true)
  }

  function handlePointerUp() {
    drawingRef.current = false
  }

  function handleClear() {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    onCapture(null)
  }

  function handleSave() {
    const canvas = canvasRef.current
    if (!canvas || !hasStrokes) return
    onCapture(canvas.toDataURL('image/png'))
  }

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full touch-none rounded-lg border border-dashed bg-white"
        style={{
          backgroundImage: initialDataUrl
            ? `url(${initialDataUrl})`
            : undefined,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="gap-1.5"
        >
          <Trash2 className="size-3.5" />
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!hasStrokes}
        >
          Use This Signature
        </Button>
      </div>
    </div>
  )
}

function TypePad({
  nameOptions,
  initialName,
  onCapture,
}: {
  nameOptions: string[]
  initialName?: string
  onCapture: (name: string) => void
}) {
  const [selected, setSelected] = useState(initialName || nameOptions[0] || '')

  return (
    <div className="space-y-4">
      <Select
        value={selected}
        onValueChange={(value) => value && setSelected(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a name" />
        </SelectTrigger>
        <SelectContent>
          {nameOptions.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed bg-white px-4">
        <p
          className="max-w-full truncate text-3xl text-slate-800"
          style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
        >
          {selected || 'Select a name to preview'}
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={() => onCapture(selected)}
          disabled={!selected}
        >
          Use This Signature
        </Button>
      </div>
    </div>
  )
}

interface SignaturePadProps {
  label: string
  value: SignatureValue | null
  onChange: (value: SignatureValue | null) => void
  nameOptions: string[]
  className?: string
  required?: boolean
}

export function SignaturePad({
  label,
  value,
  onChange,
  nameOptions,
  className,
  required,
}: SignaturePadProps) {
  const [open, setOpen] = useState(false)

  function handleDrawCapture(dataUrl: string | null) {
    onChange(dataUrl ? { type: 'drawn', data: dataUrl } : null)
    if (dataUrl) setOpen(false)
  }

  function handleTypeCapture(name: string) {
    onChange({ type: 'typed', data: name })
    setOpen(false)
  }

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-20 w-full items-center justify-center rounded-lg border border-dashed bg-background transition-colors hover:bg-muted/50',
        )}
      >
        {value?.type === 'drawn' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.data}
            alt={`${label} preview`}
            className="h-full object-contain"
          />
        ) : value?.type === 'typed' ? (
          <p
            className="text-2xl text-slate-800"
            style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
          >
            {value.data}
          </p>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <PenLine className="size-4" />
            Click to sign
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Draw a signature or select a name to use as a typed signature.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue={value?.type === 'typed' ? 'type' : 'draw'}>
            <TabsList>
              <TabsTrigger value="draw">Draw</TabsTrigger>
              <TabsTrigger value="type">Type</TabsTrigger>
            </TabsList>
            <TabsContent value="draw">
              <DrawPad
                initialDataUrl={
                  value?.type === 'drawn' ? value.data : undefined
                }
                onCapture={handleDrawCapture}
              />
            </TabsContent>
            <TabsContent value="type">
              <TypePad
                nameOptions={nameOptions}
                initialName={value?.type === 'typed' ? value.data : undefined}
                onCapture={handleTypeCapture}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
