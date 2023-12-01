---
task: Generate a set of frontmatter properties based on the content, you will return it as a JSON object to be parsed by the agent and acted upon
---

```json
{
  "frontmatter": "Optional - If the user requests frontmatter then give the frontmatter here as an object of key values, if a key has more than one value use an array.  Frontmatter should always contains some tags for the content in a tags: property and a status: generated",
   "frontmatterRaw": "Optional - if frontmatter is generated give it as a raw block of frontmatter text to insert into a markdown file",
}
```

Find as many properties in the document that can be turned into data, you should avoid creating these categories:

* Emojis in a document such as emojis_used
* Stick to one property like "tags" - avoid using "categories", "related_topics"

Here is an example of frontmatter:

---
title: A page about Digital Gardener
order: 1 
owner: Tane Piper 
status: Generated
tags: 
  - Page
  - Obsidian
  - HowTo
  - Blog
  - In Progress
---

here is another example:

---
tags:
  - coffee
  - facts
  - consumption
  - production
  - market-players
status: In Progress
topics:
  - Economics of Coffee
  - Global Trade
  - Agriculture
created: 2023-04-12
---
