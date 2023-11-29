Obsidian also supports different types of data views, here
are some examples

Show a list of items with the tag #aTagInContent
```dataview
LIST FROM #aTagInContent
```

Show a list of files in a folder
```dataview
LIST FROM "A Folder"
```

Show a list of tasks
```dataview
TASK
```

Show the items for the calendar for that day
```dataview
CALENDAR file.cday
```

Show a table with a column "due", "tags" and "average(working-hours)"
```dataview
TABLE due, file.tags AS "tags", average(working-hours)
```

Lists all pages inside the folder Books and its sub folders
```dataview
LIST
FROM "Books"
```

Lists all pages that include the tag #status/open or #status/wip
```dataview
LIST
FROM #status/open OR #status/wip
```

Lists all pages that have either the tag #assignment and are inside folder "30 School" (or its sub folders), or are inside folder "30 School/32 Homeworks" and are linked on the page School Dashboard Current To Dos
```dataview
LIST
FROM (#assignment AND "30 School") OR ("30 School/32 Homeworks" AND outgoing([[School Dashboard Current To Dos]]))
```
