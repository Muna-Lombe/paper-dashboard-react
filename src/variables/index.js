export const initData = {
  filename: 'Speakout DVD Extra Pre-Intermediate Unit 05[1].pdf',
  page_data: [
    {
      page: 0,
      size: {
        width: 2480,
        height: 3508
      },
      sections: [
        {
          section_id: 'header_1',
          content_type: 'header',
          tag: 'text_regular_text',
          content: '5 speakout DVD EXTRA',
          external_reference: {},
          branches: [
            {
              section_id: 'header_1_subheader_1',
              content_type: 'subheader',
              tag: 'text_regular_text',
              content: 'PRE-IMTERMEDIATE UNIT 5',
              external_reference: {},
              branches: []
            }
            // ... (rest of the JSON data)
          ]
        }
      ]
    }
  ]
}

export function flattenObject (obj, parentKey = '', sep = '-') {
  let items = []
  for (let key in obj) {
    let newKey = parentKey ? `${parentKey}${sep}${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      items = items.concat(flattenObject(obj[key], newKey, sep))
    } else {
      items.push([newKey, obj[key]])
    }
  }
  return items
}
export const newGuid = ()=> {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
export function unflattenArray (arr, sep = '-') {
  const result = {}

  arr.forEach(([key, value]) => {
    const keys = key.split(sep)
    keys.reduce((acc, part, index) => {
      if (index === keys.length - 1) {
        acc[part] = value // Set the value at the last key
      } else {
        // Check if the next part is a number, indicating an array index
        const nextPart = keys[index + 1]
        if (!isNaN(nextPart)) {
          acc[part] = acc[part] || [] // Create an array if it doesn't exist
          acc[part][nextPart] = acc[part][nextPart] || {} // Ensure the index exists
        } else {
          acc[part] = acc[part] || {} // Create nested object if it doesn't exist
        }
      }
      return acc[part] // Move deeper into the object
    }, result)
  })

  return result
}
export const updateObjectOrder = (obj, path, newOrder) => {
  const pathArray = path.split('.')
  const key = pathArray.pop()
  const parentPath = pathArray.join('.')
  const parent = parentPath ? getNestedValue(obj, parentPath) : obj
  console.log('paren', parent, obj)

  if (Array.isArray(parent[key])) {
    parent[key] = newOrder.map(index => parent[key][index])
  } else {
    const newObj = {}
    newOrder.forEach(key => {
      newObj[key] = parent[key]
    })
    Object.assign(parent[key], newObj)
  }

  return { ...obj }
}

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

export const findIndex = (i, yOffset, positions) => {
  let target = i
  const { top, height } = positions[i]
  const bottom = top + height

  if (yOffset > 0) {
    const nextItem = positions[i + 1]
    if (nextItem === undefined) return i

    const swapOffset = distance(bottom, nextItem.top + nextItem.height / 2) + 30
    if (yOffset > swapOffset) target = i + 1
  } else if (yOffset < 0) {
    const prevItem = positions[i - 1]
    if (prevItem === undefined) return i

    const prevBottom = prevItem.top + prevItem.height
    const swapOffset = distance(top, prevBottom - prevItem.height / 2) + 30
    if (yOffset < -swapOffset) target = i - 1
  }

  return Math.max(0, Math.min(positions.length - 1, target))
}

export const distance = (a, b) => Math.abs(a - b)

export const arrayMoveImmutable = (array, fromIndex, toIndex) => {
  const newArray = array.slice()
  const [item] = newArray.splice(fromIndex, 1)
  newArray.splice(toIndex, 0, item)
  return newArray
}
