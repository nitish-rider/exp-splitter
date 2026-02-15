'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateGroupModal } from './create-group-modal'
import { useGroups } from '@/hooks/use-group-data'

interface Group {
  id: string
  name: string
  description?: string
}

interface GroupListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function GroupList({ selectedId, onSelect }: GroupListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: groups = [], isLoading } = useGroups()

  const handleGroupCreated = () => {
    setShowCreateModal(false)
  }

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Loading groups...</div>
  }

  return (
    <>
      <div className="space-y-2">
        {groups.length === 0 ? (
          <p className="text-xs text-muted-foreground">No groups yet</p>
        ) : (
          groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelect(group.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedId === group.id
                  ? 'bg-foreground text-background'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <p className="font-medium">{group.name}</p>
              {group.description && (
                <p className="mt-0.5 text-xs opacity-75">{group.description}</p>
              )}
            </button>
          ))
        )}
      </div>

      <Button
        onClick={() => setShowCreateModal(true)}
        variant="outline"
        size="sm"
        className="mt-4 w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        New Group
      </Button>

      <CreateGroupModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onGroupCreated={handleGroupCreated}
      />
    </>
  )
}
