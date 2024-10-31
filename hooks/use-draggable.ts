import { useCallback, useEffect } from 'react'

interface DragDelta {
  x: number
  y: number
}

export function useDraggable(
  ref: React.RefObject<HTMLElement>,
  onDrag: (delta: DragDelta) => void
) {
  const handleDrag = useCallback(
    (e: MouseEvent) => {
      const delta: DragDelta = {
        x: e.movementX,
        y: e.movementY,
      }
      onDrag(delta)
    },
    [onDrag]
  )

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [handleDrag])

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      document.addEventListener('mousemove', handleDrag)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [handleDrag, handleMouseUp]
  )

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('mousedown', handleMouseDown)
    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [ref, handleMouseDown, handleDrag, handleMouseUp])

  return handleMouseDown
} 