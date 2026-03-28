'use client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { RankItem } from './RankItem'
import type { RankItem as RankItemType } from '@/lib/types'

interface Props {
  items: RankItemType[]
  correctOrder: string[]  // array of ids in correct order
  locked: boolean
  revealed: boolean
  onReorder: (items: RankItemType[]) => void
}

export function RankList({ items, correctOrder, locked, revealed, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
    </DndContext>
  )
}
