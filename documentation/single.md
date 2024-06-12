## Class `SingleElement`

### `element(locator: string, elementContent?: string): SingleElement`

Selects an HTML element according to the specified locator and element content.

- **Parameters:**
  - `locator`: The locator specifying the HTML element.
  - `elementContent` (optional): Specifies the text content of the element.

### `elements(locator: string): MultipleElement`

Selects all HTML elements according to the specified locator.

- **Parameters:**
  - `locator`: The locator specifying the HTML elements.

---

### `click(): Feature`

Clicks on the selected element.

### `hover(): Feature`

Hovers on the selected element.

### `scrollTo(): Feature`

Scrolls to the selected element.

### `copyToClipboard(): Feature`

Copies the text content of the selected element into the clipboard.

### `writeFromClipboard(): Feature`

Writes the text content of the clipboard into the selected input element.

### `write(content: string): Feature`

Writes the specified content into the selected element.

- **Parameters:**
  - `content`: The content which is written into the input element.

### `show(locators: string[]): Feature`

Scrolls to the selected element and adds the values found in the specified locators to the guide.

- **Parameters:**
  - `locators`: The locators specifying the HTML elements whose content is presented.

### `use(callback: (element: SingleElement) => void): Feature`

The currently selected element can be accessed in a callback function. This is typically used when one has to do several interactions with the same element.

### `select(): SelectElement`

Creates a select element out of the currently selected element. This is used for selects and dropdowns.
