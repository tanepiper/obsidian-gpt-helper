---
task: Generate the content for a new page in Obsidian with required page file name, frontmattter and markdown content contained in a JSON object. Make the content rich and interesting - find interesting data about the topic that can be turned into properties for filtering and querying by the user
newFile: true
output: json
---

Below is the example schema for the JSON you will respond with.

Do not modify the keys as written.  The values have the rules for each value, how it should be presented and it's required or optional

```json
{
  "filename": "Required - The file name to be used for the new file, this is also a file title.  It can only contain alphanumeric characters, hyphens and spaces.",
  "title": "Requied - A descriptive title for the content",
  "agentResponses": ["Optional - Put your response here, this is where you as an agent can give feedback - do not put your own feedback into the main body, and feedback is optional"],
  "frontmatter": "Optional - an object of keys and values. For multiple values prefer YAML object style over comma seperated. Frontmatter when generated should always contain the following: tags - a list of tags associated with the content, status: a status for the file, set it to Generated in the first instance, author: The Digital Gardener, Creation Date: todays date. It can only contain alphanumeric characters, hyphens and spaces.",
  "frontmatterRaw": "Optional - Render the frontmatter properties as raw text",
  "content": "Required - This is the markdown content requested by the user - as you are a knowledge management system the content should contain no commentary for the agent, it should be well structured markdown with headings, #hashTags for tagging, images, links and other content"
}
```


