## Class `Feature`

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

### `go(url: string): Feature`

Navigates to the specified website URL.

- **Parameters:**
  - `url`: The URL of the website to navigate to.

### `waitFor(locator: string): Feature`

Waits until the specified element appears on the webpage.

- **Parameters:**
  - `locator`: The locator specifying the HTML element.

### `waitWhile(locator: string): Feature`

Waits while the specified element is present on the webpage.

- **Parameters:**
  - `locator`: The locator specifying the HTML element.

### `prepare(feature: Feature): Feature`

Adds a feature which is prepared to the current feature. These features are executed **before** the current feature without generating a guide, screenshots, or video.

- **Parameters:**
  - `feature`: The feature which is prepared before the current feature.
