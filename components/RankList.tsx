'use client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useState } from 'react'
import { RankItem } from './RankItem'
import type { RankItem as RankItemType } from '@/lib/types'

interface Props {
  items: RankItemType[]
  correctOrder: string[]
  locked: boolean
  revealed: boolean
  onReorder: (items: RankItemType[]) => void
}

export function RankList({ items, correctOrder, locked, revealed, onReorder }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null
  const activeIndex = activeItem ? items.indexOf(activeItem) : -1

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item, index) => {
            const correctIndex = revealed ? correctOrder.indexOf(item.id) : undefined
            return (
              <RankItem
                key={item.id}
                item={item}
                index={index}
                locked={locked}
                revealedCorrectIndex={correctIndex}
              />
            )
          })}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeItem && (
          <RankItem
            item={activeItem}
            index={activeIndex}
            locked={false}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
