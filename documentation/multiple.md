## Class `MultipleElement`

### `elements(locator: string): MultipleElement`

Selects all HTML elements according to the specified locator.

- **Parameters:**
  - `locator`: The locator specifying the HTML elements.

---

### `show(locators: string[]): Feature`

Scrolls to the selected elements and adds the values found in the specified locators to the guide.

- **Parameters:**
  - `locators`: The locators specifying the HTML elements, whose content is presented.

### `use(callback: (element: MultipleElement) => void): Feature`

The currently selected elements can be accessed in a callback function. This is typically used when one has to do several interactions with the same elements.

---

### `where(locator: string, value: string): MultipleElement`

Adds a search constraint to the elements selection. Only elements which contain an element according to the specified locator with the specified value are selected.

- **Parameters:**
  - `locator`: The locator specifying the HTML element.
  - `value`: The text content of the HTML element specified by the locator.

### `first(): SingleElement`

Selects the first element of the selected elements.

### `last(): SingleElement`

Selects the last element of the selected elements.

### `at(index: number): SingleElement`

Selects the element at the specified index of the selected elements.

- **Parameters:**
  - `index`: The index of the selected element.

### `slice(start: number, end: number): MultipleElement`

Selects the elements in the specified section of the selected elements.

- **Parameters:**
  - `start`: The start index of the selected elements.
  - `end`: The end index of the selected elements.
