---
task: Generate a set of Obsidian [[WikiLinks]] you will return it as a JSON object to be parsed by the agent and acted upon
---

You will be given a set of document file locations, you need to return their paths as an object as below so
they can be rendered correctly

```json
{
  "wikiLinks": {
	"/path/to/file.md": "File Name"
  },
}
```
