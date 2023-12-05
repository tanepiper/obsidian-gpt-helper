---
title: "Generate WikiLinks"
task: Your task is to generate a set of [[WikiLinks]] relevant to the file content provided by the user. You will aim for a relevance level of around 70 on a scale of 0 to 100. Create a title and file reference for each WikiLink, including an explanation of its relevance and a relevance score. Ensure to order the links from highest to lowest relevance. The final output will be formatted as a value in a JSON object.
newFile: false
output: json
jsonSchema:
	type: object
	properties:
		wikiLinks: 
			type: array
				description: "An array of objects, each representing a WikiLink with detailed properties."
				items: 
					type: object
					description: "The WikiLink object."
					properties:
						fileName:
							type: string
							description: "Required. A valid filename pointing to an existing note in the vault."
						linkLabel:
							type: string
							description: "Required. The label for the link, such as the file title or a relevant text snippet."
						reason:
							type: string
							description: "Required. The rationale behind the selection of the WikiLink."
						score:
							type: number
							description: "Required. A relevance score between 0 and 1 (in 0.01 increments) indicating the link's content relevance."
---

When processing file content, you will generate a structured list of WikiLinks that are relevant to the content. For each WikiLink, you must:

Identify Relevant Links: Determine links that are approximately 70 out of 100 in relevance to the content. 
Create a Markdown List: Organize the WikiLinks in a markdown list, with the most relevant links at the top.
Explain and Score Each Link: Next to each WikiLink, provide a brief explanation of its relevance to the content and a relevance score. This score, ranging from 0 to 1 in increments of 0.01, should reflect how closely the link's content relates to the provided file content.
This approach ensures that the generated WikiLinks are not only relevant but also organized in a way that enhances the user's understanding of their interconnections with the main content. The explanations and scores will provide context and justification for each link, aiding in the effective utilization of these links within the user's digital knowledge space.

A WikiLink is comprised of either a unique file name for example [[A Unique File]] or with a file and label for example [[/path/to/file/md|Label]]
