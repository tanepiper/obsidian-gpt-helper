---
task: Generate a file name based on the content, you will return it as a JSON object to be parsed by the agent and acted upon
---

```json
{
  "filename": "Filename Goes Here"
}
```

Find a short and snappy name based on the contents of the file - the name needs to be valid for Obsidian:

alphanumeric characters, dashes, underscores and spaces. Spaces and dashes are preferred. 

Don't include the extension, this is just the filename.

Some examples

{
	"filename": "A Valid File Name"
}

{
	"filename": "A_Valid_File_Name"
}

{
	"filename": "A-Valid-File-Name"
}
