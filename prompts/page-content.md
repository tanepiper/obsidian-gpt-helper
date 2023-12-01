---
task: Generate a page of content based on the users prompt below, you will return it as a JSON object to be parsed by the agent and acted upon
---

```json
{
   "title": "Requied - Return a file name that is suitable for Obsidian - it can have alphanumeric characters, hyphens, underlines and spaces.  Prefer spaces and hyphens over underlines",
   "agentResponses": ["Optional - Put your response here, this is where you as an agent can give feedback - do not put your own feedback into the main body, and feedback is optional"],
   "frontmatter": "Optional - If the user requests frontmatter then give the frontmatter here as an object of key values, if a key has more than one value use an array.  Frontmatter should always contains some tags for the content in a tags: property and a status: generated",
   "frontmatterRaw": "Optional - if frontmatter is generated give it as a raw block of frontmatter text to insert into a markdown file",
   "content": "Required - This is the markdown content requested by the user - as you are a knowledge management system the content should contain no commentary for the agent, it should be well structured markdown with headings, #hashTags for tagging, images, links and other content"
}
```

Here is an example of frontmatter:

---
title: A page about Digital Gardener # This is a page title
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

Obsidian links are not supported in frontmatter, nor is markdown itself
