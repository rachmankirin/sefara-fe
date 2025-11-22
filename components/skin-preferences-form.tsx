"use client"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type SkinPreferences = {
  skinType: "normal" | "oily" | "dry" | "combination" | "sensitive"
  concerns: string[]
  sunscreenPreferred: boolean
}

export function SkinPreferencesForm({
  value,
  onChange,
}: {
  value: SkinPreferences
  onChange: (next: SkinPreferences) => void
}) {
  function toggleConcern(c: string) {
    const has = value.concerns.includes(c)
    const next = has ? value.concerns.filter((x) => x !== c) : [...value.concerns, c]
    onChange({ ...value, concerns: next })
  }

  return (
    <Card>
      <CardContent className="pt-6 grid gap-4">
        <div className="grid gap-2">
          <Label>Jenis kulit</Label>
          <Select
            value={value.skinType}
            onValueChange={(v) =>
              onChange({
                ...value,
                skinType: v as SkinPreferences["skinType"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis kulit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="oily">Berminyak</SelectItem>
              <SelectItem value="dry">Kering</SelectItem>
              <SelectItem value="combination">Kombinasi</SelectItem>
              <SelectItem value="sensitive">Sensitif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Kekhawatiran kulit</Label>
          <div className="grid grid-cols-2 gap-3">
            {["acne", "aging", "dryness", "redness", "dark-spots"].map((c) => (
              <label key={c} className="inline-flex items-center gap-2 text-sm">
                <Checkbox checked={value.concerns.includes(c)} onCheckedChange={() => toggleConcern(c)} />
                <span className="capitalize">{c.replace("-", " ")}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <Checkbox
            checked={value.sunscreenPreferred}
            onCheckedChange={(v) => onChange({ ...value, sunscreenPreferred: Boolean(v) })}
          />
          <span>Prioritaskan sunscreen</span>
        </label>
      </CardContent>
    </Card>
  )
}
