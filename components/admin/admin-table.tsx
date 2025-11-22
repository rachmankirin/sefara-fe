"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface AdminTableProps {
  columns: Column[]
  data: any[]
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  loading?: boolean
}

export function AdminTable({ columns, data, onEdit, onDelete, loading }: AdminTableProps) {
  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>
  }

  if (data.length === 0) {
    return <p className="text-muted-foreground">No data available</p>
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-sm font-semibold">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-muted/50 transition">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-3 text-sm">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(row)}
                          className="gap-2 bg-transparent"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="destructive" size="sm" onClick={() => onDelete(row)} className="gap-2">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
