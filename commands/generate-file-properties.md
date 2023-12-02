---
task: Generate the JSON for frontmatter properties in Obsidian, for the content passed to you - find interesting data about the topic that can be turned into properties for filtering and querying by the user
newFile: false
output: json
---

Below is the example schema for the JSON you will respond with.

Do not modify the keys as written. The values have the rules for each value, how it should be presented and it's required or optional

```json
{
	"frontmatter": [
		{
			"key": "property1",
			"value": "A property value",
			"reason": "Give an explination here",
			"score": 0.97
		},
		{
			"fileName": "property2",
			"path": ["multiple", "property", "values"],
			"reason": "Give an explination here",
			"score": 0.7
		}
	]
}
```
