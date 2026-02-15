'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/use-group-data'

interface Category {
  id: string
  group_id: string
  name: string
  icon: string | null
  color: string | null
  created_at: string
}

interface ManageCategoriesModalProps {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCategoriesUpdated?: () => void
}

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#64748b', // slate
]

const DEFAULT_ICONS = [
  '🍔', '🍕', '☕', '🛒', '🏠', '🚗', '✈️', '🎬',
  '💊', '👕', '🎮', '📚', '💰', '🎁', '🔧', '⚽',
]

export function ManageCategoriesModal({
  groupId,
  open,
  onOpenChange,
  onCategoriesUpdated,
}: ManageCategoriesModalProps) {
  const { data: categories = [] as Category[] } = useCategories(groupId)
  const addCategory = useAddCategory(groupId)
  const updateCategory = useUpdateCategory(groupId)
  const deleteCategory = useDeleteCategory(groupId)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLORS[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      if (editingId) {
        await updateCategory.mutateAsync({
          categoryId: editingId,
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        })
        toast.success('Category updated')
      } else {
        await addCategory.mutateAsync({
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        })
        toast.success('Category created')
      }
      resetForm()
      onCategoriesUpdated?.()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
    setSelectedIcon(category.icon)
    setSelectedColor(category.color || DEFAULT_COLORS[0])
    setIsAdding(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      await deleteCategory.mutateAsync(categoryId)
      toast.success('Category deleted')
      onCategoriesUpdated?.()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }

  const resetForm = () => {
    setName('')
    setSelectedIcon(null)
    setSelectedColor(DEFAULT_COLORS[0])
    setEditingId(null)
    setIsAdding(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Create and manage expense categories for your group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Categories */}
          <div>
            <h3 className="text-sm font-medium mb-3">Your Categories</h3>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet. Create one below!</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category: Category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                      style={{ backgroundColor: category.color || '#94a3b8' }}
                    >
                      {category.icon || <Tag className="h-5 w-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{category.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        disabled={addCategory.isPending || updateCategory.isPending || deleteCategory.isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        disabled={addCategory.isPending || updateCategory.isPending || deleteCategory.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>

              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Food, Transport, Entertainment"
                  required
                />
              </div>

              <div>
                <Label>Icon (optional)</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {DEFAULT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center text-xl hover:scale-110 transition-transform ${
                        selectedIcon === icon
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 rounded-lg border-2 hover:scale-110 transition-transform ${
                        selectedColor === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addCategory.isPending || updateCategory.isPending}>
                  {(addCategory.isPending || updateCategory.isPending) ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Category
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
