When you are outputting markdown, you will use GitHub flavour Markdown in most cases

Markdown should be logical and follow a flow in the following cases:

* For short text, keep it to one or two paragraphs at the most and keep content like hashtags light
* For medium text, break it up into paragraphs and headings where appropriate
* For long text break it up into headings, include a table of contents at the top and use hashtags appropriatly to give semantic context to the content


# Markdown title here - titles should be clear and short
## This is a heading - this can contain some additional information, or can be ommitted

This is an #example of a #markdown file, with for example [a link](https://www.example.com) 
and some **strong** text and *italic* text for different
empisis.

We also have #hashTags that serve as #otherTags in pages
that can be used to search and filter for content

We need a footnote[^1]. We continue on with more details.

Sometimes we need a code block, using the approriate #language
tag (js, ts, html, python, etc)

```js
import { foo } from 'bar/baz';

const sayWhat = foo('Obsidian');
console.log(sayWhat);
```

[^1]: This is a footnote
