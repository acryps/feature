## Outline of Drag-and-Drop

1. Drag one element onto another element

```typescript
feature.drag('drag-element').to('drop-element')
```

### Implementation:
- Get the start coordinates of the HTML element gathered in `drag()` (analogous to `element()`).
- Get the end coordinates of the HTML element gathered in `to()` (analogous to `element()`).
- Use Puppeteer's `mouse.dragAndDrop()` or `mouse.down()` with the start and end coordinates (implement in `mouse.ts`).

2. Drag within a selected area

```typescript
feature.element('drag-area').drag('drag-element').to(0, 1) // Drag 'drag-element' within 'drag-area' to location (0, 1)

feature.element('drag-area').drag(1, 1).to(0, 1) // Drag mouse from (1, 1) to (0, 1) within 'drag-area'

feature.element('drag-area').drag(1, 1).to('drop-element') // Drag from (1, 1) within 'drag-area' to 'drop-element'
```

### Implementation:
- Select the drag area in `element()`, defining the scope of the drag.
- Normalize the selected area to a size of 1x1 (x in [0,1], y in [0,1]).
- Select either the drag element or drag location using coordinates.
- Select either the drop element or drop location using coordinates.
- Use the coordinates and Puppeteer's `mouse.dragAndDrop()` or `mouse.down()` to perform the drag (implement in `mouse.ts`).