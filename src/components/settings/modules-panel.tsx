'use client'

import { useState } from 'react'

import { Switch } from '@/components/ui/switch'
import {
  MODULES,
  SYSTEM_CONTROLS,
  type ControlItem,
  type ModuleItem,
} from '@/components/settings/modules-data'

export function ModulesPanel() {
  const [modules, setModules] = useState<ModuleItem[]>(MODULES)
  const [controls, setControls] = useState<ControlItem[]>(SYSTEM_CONTROLS)

  function toggleModule(id: string) {
    setModules((prev) =>
      prev.map((module) =>
        module.id === id ? { ...module, enabled: !module.enabled } : module,
      ),
    )
  }

  function toggleControl(id: string) {
    setControls((prev) =>
      prev.map((control) =>
        control.id === id ? { ...control, enabled: !control.enabled } : control,
      ),
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold">Modules</h2>
        <p className="text-sm text-muted-foreground">
          Enable or disable major features across the system.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <div
                key={module.id}
                className="flex items-start justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{module.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={module.enabled}
                  onCheckedChange={() => toggleModule(module.id)}
                  aria-label={`Toggle ${module.name}`}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold">System Controls</h2>
        <p className="text-sm text-muted-foreground">
          Fine-tune specific behaviors for staff and patients.
        </p>

        <div className="mt-4 divide-y rounded-xl border bg-card shadow-sm">
          {controls.map((control) => (
            <div
              key={control.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{control.name}</p>
                <p className="text-sm text-muted-foreground">
                  {control.description}
                </p>
              </div>
              <Switch
                checked={control.enabled}
                onCheckedChange={() => toggleControl(control.id)}
                aria-label={`Toggle ${control.name}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
