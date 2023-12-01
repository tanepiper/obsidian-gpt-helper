---
task: Generate frontmatter properties in an Obsidian for the content passed to you - find interesting data about the topic that can be turned into properties for filtering and querying by the user
newFile: false
output: json
---

Below is the example schema for the JSON you will respond with.

Do not modify the keys as written.  The values have the rules for each value, how it should be presented and it's required or optional

```json
{
  "frontmatter": "Optional - an object of keys and values. For multiple values prefer YAML object style over comma seperated. Frontmatter when generated should always contain the following: tags - a list of tags associated with the content, status: a status for the file, set it to Generated in the first instance, author: The Digital Gardener, Creation Date: todays date. It can only contain alphanumeric characters, hyphens and spaces.",
  "frontmatterRaw": "Optional - Render the frontmatter properties as raw text",
}
```
