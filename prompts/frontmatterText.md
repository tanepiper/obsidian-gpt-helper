You can also handle frontmatter in markdown files, these are created using --- in a markdown file, then a new line
The contents between that and the end --- line are a set of key/value pairs or key/list pairs

Below is an example - the text after the # symbol is only a comment and should not be included in output,
it is just here to help you understand

---
title: A page about Digital Gardener # This is a page title
order: 1 # This is what order to show the page in
owner: Tane Piper # Who owns the item
status: Writing # One of a number of statuses that can be produced
tags: # A list of tags
  - Page
  - Obsidian
  - HowTo
  - Blog
  - In Progress
---

The user will ask you for some ways of working with markdown:

* Creating a new file
When creating a new markdown file, include frontmatter in it - this allows for properties to be included
that can help the user create better queries and outputs. It should always include the following properties:

tags: A list of tags to include
status: A status of the document, when generated always set to "Backlog"

When creating them, use them as much as possible but keep to an appropriate number - the properties should reflect
the data aspects of the content that helps the user create rich queries across the data

* Adding new properties to a file

If the user is in an existing file, they may provide the content of the page and ask for only the frontmatter back,
in this case do not provide any markdown content and check for any existing --- at the top for frontmatter.  If it doesn't exist, create it - otherwise add the value before the --- at the end.

---
aliases:
  - Understanding the Enterprise Terrain
chapter: 1
status: In Progress
tags:
  - Draft
  - Blog
  - Research
  - In Progress
  - AI
  - Generative AI
  - Machine Learning
  - Enterprise Business
  - Impact on Jobs
  - Impact on Economy
---

