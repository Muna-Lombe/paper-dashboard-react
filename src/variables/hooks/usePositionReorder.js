import { useState, useRef } from 'react'
import { clamp, distance } from 'popmotion'
import move, { arrayMoveImmutable } from 'array-move'

export function usePositionReorder (initialState) {
  const [order, setOrder] = useState(initialState)

  // We need to collect an array of height and position data for all of this component's
  // `Item` children, so we can later us that in calculations to decide when a dragging
  // `Item` should swap places with its siblings.
  const positions = useRef([]).current
  const updatePosition = (i, offset) => (positions[i] = offset)

  // Find the ideal index for a dragging item based on its position in the array, and its
  // current drag offset. If it's different to its current index, we swap this item with that
  // sibling.
  const updateOrder = (i, dragOffset) => {
    const targetIndex = findIndex(i, dragOffset, positions)
    if (targetIndex !== i) setOrder(arrayMoveImmutable(order, i, targetIndex))
    console.log("is equal:", i, targetIndex);
    console.log("new order :", order );
    
  }

  const updateState = (newState)=>{
    setOrder(
      newState
    )
  }

  return [order, updatePosition, updateOrder, updateState]
}

const buffer = 30

export const findIndex = (i, yOffset, positions) => {
  let target = i
  const { top, height } = positions[i]
  const bottom = top + height

  // If moving down
  if (yOffset > 0) {
    const nextItem = positions[i + 1]
    if (nextItem === undefined) return i

    const swapOffset =
      distance(bottom, nextItem.top + nextItem.height / 2) + buffer
    if (yOffset > swapOffset) target = i + 1

    // If moving up
  } else if (yOffset < 0) {
    const prevItem = positions[i - 1]
    if (prevItem === undefined) return i

    const prevBottom = prevItem.top + prevItem.height
    const swapOffset = distance(top, prevBottom - prevItem.height / 2) + buffer
    if (yOffset < -swapOffset) target = i - 1
  }

  return clamp(0, positions.length, target)
}
