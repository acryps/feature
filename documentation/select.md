## Class `SelectElement`

### `first(): Feature`

Selects the first option of the select.

**Example**
```typescript
feature.element('language select').first();
```

### `last(): Feature`

Selects the last option of the select.

**Example**
```typescript
feature.element('language select').last();
```

### `at(index: number): Feature`

Selects the option at the specified index.

- **Parameters:**
  - `index`: The index of the selected element.

**Example**
```typescript
feature.element('language select').at(3);
```

### `value(value: string): Feature`

Selects the option according to the specified value.

- **Parameters:**
  - `value`: Specifies the text value of the option which is selected.

**Example**
```typescript
feature.element('language select').value('German');
```