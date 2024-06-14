## Class `MultipleElement`

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

### `show(locators: string[]): Feature`

Scrolls to the selected elements and adds the values found in the specified locators to the guide.

- **Parameters:**
	- `locators`: The locators specifying the HTML elements, whose content is presented.

**Example**
```typescript
// selects all 'panel' HTML elements
feature.elements('panels panel')
	.show(['name']);
```

### `use(callback: (element: MultipleElement) => void): Feature`

The currently selected elements can be accessed in a callback function. 
This is typically used when one has to do several interactions with the same elements.

**Example**
```typescript
// selects all 'panel' HTML elements
feature.elements('panels panel').use(elements => {
	elements.first().hover();
	elements.last().click();

	elements.at(1)
		.element('name').copyToClipboard();

	// further instructions using the current selected elements ...
});
```

---

### `where(locator: string, value: string): MultipleElement`

Adds a search constraint to the elements selection. 
Only elements which contain an element according to the specified locator with the specified value are selected.

- **Parameters:**
	- `locator`: The locator specifying the HTML element.
	- `value`: The text content of the HTML element specified by the locator.

**Example**
```typescript
// selects all 'panel' HTML elements
feature.elements('panels panel')
	// which has a HTML element 'name' with content 'Technical Details'
	.where('name', 'Technical Details')
	.first();

// add several .where statements
feature.elements('panels panel')
	.where('name', 'Technical Details')
	.where('project', 'Project 1')
	.last();
```

### `first(): SingleElement`

Selects the first element of the selected elements.

**Example**
```typescript
feature.elements('panels panel').first();
```

### `last(): SingleElement`

Selects the last element of the selected elements.

**Example**
```typescript
feature.elements('panels panel').last();
```

### `at(index: number): SingleElement`

Selects the element at the specified index of the selected elements.

- **Parameters:**
	- `index`: The index of the selected element.

**Example**
```typescript
// return 5th panel (indexing starts at 0)
feature.elements('panels panel').at(4);
```

### `slice(start: number, end: number): MultipleElement`

Selects the elements in the specified section of the selected elements.

- **Parameters:**
	- `start`: The start index of the selected elements.
	- `end`: The end index of the selected elements.

**Example**
```typescript
feature.elements('panels panel').slice(1, 5);

feature.elements('panels panel').slice(1, 5)
	.show(['name']);
```
