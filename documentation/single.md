## Class `SingleElement`

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

### `click(): Feature`

Clicks on the selected element.

**Example**
```typescript
feature.element('button', 'Submit').click();
```

### `hover(): Feature`

Hovers on the selected element.

**Example**
```typescript
feature.element('button', 'Submit').hover();
```

### `scrollTo(): Feature`

Scrolls to the selected element.

**Example**
```typescript
feature.elements('images image').at(3).scrollTo();
```

### `copyToClipboard(): Feature`

Copies the text content of the selected element into the clipboard.

**Example**
```typescript
feature.element('product-code').copyToClipboard();
```

### `writeFromClipboard(): Feature`

Writes the text content of the clipboard into the selected input element.

**Example**
```typescript
feature.element('product-search input').writeFromClipboard();
```

### `write(content: string): Feature`

Writes the specified content into the selected element.

- **Parameters:**
  - `content`: The content which is written into the input element.

**Example**
```typescript
feature.element('product-search input').write('product XY');
```

### `show(locators: string[]): Feature`

Scrolls to the selected element and adds the values found in the specified locators to the guide.

- **Parameters:**
  - `locators`: The locators specifying the HTML elements whose content is presented.

**Example**
```typescript
feature.elements('products product').first().show(['name']);
```

### `use(callback: (element: SingleElement) => void): Feature`

The currently selected element can be accessed in a callback function. 
This is typically used when one has to do several interactions with the same element.

**Example**
```typescript
feature.element('product-code').use(element => {
	element.hover();
	element.copyToClipboard();

	element.click();
});
```

---

### `select(): SelectElement`

Creates a select element out of the currently selected element. 
This is used for selects and dropdowns.

**Example**
```typescript
feature.element('language select').first();

feature.element('language select').value('German');
```
