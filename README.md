## Features - What and Why

Define your own web application features!

Using Features, you can easily define and automatically execute custom features for your web application to generate guides, screenshots, and videos.

**Why would I want to define all these features to generate guides, screenshots, or videos?** Imagine you have finished the first version of your web application and created complete video guides for its functionalities. After a couple of weeks, the web application is redesigned. Now the videos are outdated, and you have to tediously recreate the video guides again by hand. Not with Features! With Features, you can simply re-execute the features, and the video guides are regenerated for the updated web application within seconds.

## Requirements

To use Features, you need to install [ffmpeg](https://ffmpeg.org/).

## Usage

The following shows an example where a product is configured. 

Features uses **method chaining** in order **to define the instructions of the feature**. Each instruction can simply be chained after the previous one.

```typescript
// define your project
const project = new Project('assembly', 'https://assembly.acryps.com');

// define your own feature
const feature = new Feature('basic usage', 'demonstrate basic usage of feature');
	// navigate to website
	.go(`https://assembly.acryps.com/`)

	// find html element 'action' which has content 'Action' and click it
	.element('action', 'Create').click()

	// wait while html element 'indicator' is present
	.waitWhile('indicator')

	// find html element 'Body Type' and click it
	.element('name', 'Body Type').click()

	.element('name', 'Wafer').click()

	.element('action', 'Save As...').click()

	// find html input element 'save-assembly input' and write 'My Configuration' into input field
	.element('save-assembly input').write('My Configuration')
	.element('action', 'Add to my Assemblies').click();

// execute the feature for a project
const result = await feature.execute(project)
	.guide()								// generate a guide
	.screenshot()							// generate screenshots for each step
	.video('./basic-usage/video.webm')		// generate video
	.run();

// save result
await result.save('./media/basic-usage');
```

## Elements

In order to interact with a web application, we need to be able to tell Features which elements we want to interact with. To do this, we have `element` to handle single elements and `elements` to handle multiple elements. Both of those use 'locators' to search the element on the webpage. These locators describe the HTML tags of the elements.

For example, if we have the following webpage:

```html
<html>
	<body>
		<title>
			<name>Title</name>
		</title>

		<panels>
			<panel>
				<name>panel 1</name>
			</panel>

			<panel>
				<name>panel 2</name>
			</panel>
		</panels>
	</body>
</html>
```

We can select the title like this:

```typescript
feature.element('title name')
	// and then interact with it
	.click()
```

We can interact with multiple elements, such as the `panels`:

```typescript
// now we selected all the 'panel' elements
feature.elements('panels panel')
```

To interact with a single panel, we have to filter them. This can be done in various ways:

```typescript
// select the first panel
feature.elements('panels panel').first()
	// then click on the selected element
	.click()

// get the element at index 1 (the second element)
feature.elements('panels panel').at(1)
	// then hover on it
	.hover()

// filter according to where conditions
feature.elements('panels panel')
	// select the panel which has an element 'name' with content 'panel 1'
	.where('name', 'panel 1')
	.first()
		.click()
```

This is the basic usage of `element` and `elements`. However, the chaining of elements is unlimited, so you can do much more!

Please refer to the class documentation for detailed descriptions of the functions available for [Feature](./documentation/feature.md), [SingleElement](./documentation/single.md), [MultipleElement](./documentation/multiple.md) and [Select](./documentation/select.md).

## Execution and Result

After having defined your own feature, it's time to execute it!

A feature can be executed using `execute`, a `project`, and a `viewport`.

```typescript
const project = new Project('example-project', 'https://example.com');
const viewport = { width: 1280, height: 720, deviceScaleFactor: 1 };

const execution = feature.execute(project, viewport);
```

This returns an instance of `Execution`. Using an execution, we can specify how we want to execute the feature. By adding `guide`, `screenshot`, or `video`, we can specify if we want to generate a guide, screenshots, or video.
We can additionally tell the execution to **not** run in `headless` mode, meaning you will be able to see the browser executing the feature. This can be done by simply adding a boolean value to the run function: `.run(false)`.

```typescript
// generate guide, screenshot, and video
const result = await execution
	.guide()
	.screenshot()
	.video('./media/video.webm')
	.run();    // running headless
```

Finally, you can save your result using the `ExecutionResult`.

```typescript
await result.save('./media/example');
```

## Further Documentation

For more detailed documentation and extended usage, see [here](./documentation/).