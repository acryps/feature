## Class `Feature`

### `element(locator: string, elementContent?: string): SingleElement`

Selects an HTML element according to the specified locator and element content.

- **Parameters:**
	- `locator`: The locator specifying the HTML element.
	- `elementContent` (optional): Specifies the text content of the element.

**Example**
```typescript
feature.element('title name');

feature.element('title name', 'My Title');
```

### `elements(locator: string): MultipleElement`

Selects all HTML elements according to the specified locator.

- **Parameters:**
	- `locator`: The locator specifying the HTML elements.

**Example**
```typescript
// selects all 'panel' HTML elements
feature.elements('panels panel');
```

---

### `go(url: string): Feature`

Navigates to the specified website URL.

- **Parameters:**
	- `url`: The URL of the website to navigate to.

**Example**
```typescript
feature.go('https://acryps.com/');
```

### `waitFor(locator: string): Feature`

Waits until the specified element appears on the webpage.

- **Parameters:**
	- `locator`: The locator specifying the HTML element.

**Example**
```typescript
// wait until 'loaded' HTML element appears
feature.waitFor('loaded');
```

### `waitWhile(locator: string): Feature`

Waits while the specified element is present on the webpage.

- **Parameters:**
	- `locator`: The locator specifying the HTML element.

**Example**
```typescript
// wait while 'spinner' HTML element is present
feature.waitWhile('spinner');

// usually this is needed, after some interaction with the webpage
feature.element('button', 'Submit').click()
	.waitWhile('loader');
```

### `prepare(feature: Feature): Feature`

Adds a feature which is prepared to the current feature. These features are executed **before** the current feature without generating a guide, screenshots, or video.

- **Parameters:**
	- `feature`: The feature which is prepared before the current feature.

**Example**
```typescript
const prepareFeature = new Feature('prepare-feature', 'example prepare feature')
	.element('button', 'Submit').click();

	// further instructions ...

const feature = new Feature('feature', 'example feature using prepare')
	.prepare(prepareFeature)

	.element('button', 'Continue').click();

	// further instructions ...
```