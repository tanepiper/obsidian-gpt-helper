---
task: Generate a set of data for [[WikiLinks]] to relevent content connected to the file content that the user passes you, if the scale is 0 to 10, it should be about 7 - generate the content at a markdown list with a header, next to each wikilink give an explination why and the relevency score.  You can deviate down to a 5 if you feel it might still be relevent but order from highest to lowest.  The result will be output as a value in a JSON object.
newFile: false
output: json
---

Below is the example schema for the JSON you will respond with.

Do not modify the keys as written.  The values have the rules for each value, how it should be presented and it's required or optional

```json
{
  "wikiLinks": [{
	"fileName": "File Name 2",
	"path": "/path/to/file2.md",
	"reason": "Give an explination here",
	"score": 0.97
  }, {
	"fileName": "File Name 1",
	"path": "/path/to/file1.md",
	"reason": "Give an explination here",
	"score": 0.7
  }],
}
```
