"use client"

import { Input } from "@/components/ui/input"

interface AdminFormFieldProps {
  label: string
  type?: string
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

export function AdminFormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  options,
}: AdminFormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "select" && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-24"
        />
      ) : (
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  )
}
