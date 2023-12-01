---
task: Take the content of the file the user has given you, and come up with some ideas for a file name, a minimuim of 3. The file names must be suitable for Obsidian on all operating systems so can only contain the following - Alphanumeric characters, hyphens/dashes, underscores and spaces.  Spaces and hyphens are prefered.  You do not need to give the file extension as this will be provided by the system, and if you have more than 3 name ideas present them as well
newFile: false
output: json
---

Below is the example schema for the JSON you will respond with, remember the values provide some instructions for you

Do not modify the keys as written. The values have the rules for each value, how it should be presented and it's required or optional

```json
{
	"filenames": [
		{
			"fileName": "One descriptive name of content",
			"reason": "Give an explination here of why you chose this filename",
			"score": 0.97
		},
		{
			"fileName": "Another descriptive name of content",
			"reason": "Give an explination here of why you chose this filename",
			"score": 0.8
		},
		{
			"fileName": "Yet another descriptive name of content",
			"reason": "Give an explination here of why you chose this filename",
			"score": 0.7
		}
	]
}
```

Here is it's typescript interface

```ts
/**
 * A response from the OpenAI API that contains a filename with the reason and score for it's selection
 */
interface DGFileNameResponse {
	/**
	 * The filename, it should support all OS with only alphanumeric characters, spaces, hyphens, and underscores.
	 * Spaces and hyphens are preferred over underscores.
	 */
	fileName: string;
	/**
	 * The agent reason for selecting this filename
	 */
	reason: string;
	/**
	 * The confidence score for this filename the AI thinks it should be
	 */
	score: number;
}
```

If the contents is a summary for example call it "Summary of ...", if it's a list "List of ..." if it's prose or content of a fictional nature "Prose page of ...", Poerty, Technical Article or Chapter, etc - come up with a clear name that reflects the contents and the potential links it contains
