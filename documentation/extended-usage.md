# Extended Feature Usage

## Defining the Project

For each feature, you can select a project. The project can be customized according to your needs. You might be confused why this is nice to have, let us make an example:

Imagine you have a project which has pages that look like this:

```html
<html>
	<body>
		<ui-title>
			<ui-name>Title</ui-name>
		</ui-title>

		<ui-panels>
			<ui-panel>
				<ui-name>panel 1</ui-name>
			</ui-panel>

			<ui-panel>
				<ui-name>panel 2</ui-name>
			</ui-panel>
		</ui-panels>
	</body>
</html>
```

Normally, we would have to create features that look like the following:

```typescript
const feature = new Feature('wrap-example', 'example showing the benefit of a custom wrap function')
	.element('ui-title ui-name').click()

	.elements('ui-panels ui-panel').last().hover()
```

As you can see, we always have to add the prefix '`ui-`'. This is project specific and can be simplified using the project `wrap` function!

```typescript
const project = new Project('example-project', 'https://example.com');

// override default selector wrapper
project.wrap = (locatorPart: string) => {
	return [`${locatorPart}`, `ui-${locatorPart}`, `.${locatorPart}`, `[${locatorPart}]`];
}
```

The wrap function defines how the locator parts in the locator are wrapped in order to create a selector, which is then used to find the according HTML element.

Using the above `wrap` function, we can now access the elements as follows.

```typescript
const feature = new Feature('wrap-example', 'example showing the benefit of a custom wrap function')
	.element('title name').click()

	.elements('panels panel').last().hover()
```

Next to the `wrap` function, you can define the `join` function. This method specifies how the locator parts are joined together to create a selector. The default is the following.

```typescript
const project = new Project('example-project', 'https://example.com');

project.join = (first: string, second: string) => {
	let separator = ' ';

	if (second.at(0).includes('.') || second.at(0).includes('[')) {
		separator = '';
	}

	return `${first}${separator}${second}`;
}
```

## Using Feature Screenshots to Compare Project Versions

Features can additionally be used to **find bugs or unwanted UI changes across different project versions**. To do this, the screenshots of features across different project versions can be visually compared to find differences.

To do this, you need two saved execution results of the same feature for two different project versions. (See how to save execution results [here](../README.md#execution-and-result).)

You need to load the two results and then compare the images.

```typescript
const version1 = new ExecutionResult().load('./version_1/result');
const version2 = new ExecutionResult().load('./version_2/result');

const differences = await version1.getImageDifferences(version2);
```

The returned differences display all visual differences.

In these examples, **all** differences will be displayed. Sometimes we may not want this. Imagine you have an area on your website which displays animations or other changing elements. These elements you might want to ignore during the comparison. To do this, you can specify elements which should be ignored using `ignore`. This has to be done for a project and before the feature is executed.

```typescript
const project = new Project('example-project', 'https://example.com');

project.ignore('activity-indicator');
project.ignore('loader');
```

These elements will be stored as 'ignored elements' and will be ignored during `getImageDifferences`.