---
title: "Rename file from contents"
task: Your task is to analyze the content of a file provided by the user and suggest suitable file names. Generate a minimum of 3 and a maximum of 6 file names that adhere to Obsidian's compatibility requirements across different operating systems. Focus on using alphanumeric characters, hyphens/dashes, underscores, and spaces, with a preference for spaces and hyphens. For each proposed file name, provide a justification for your choice and a confidence score reflecting how well the name matches the content.
newFile: false
output: json
jsonSchema:
	type: object
	properties:
		filenames: 
			type: array
				description: "An array of objects, each containing a file name suggestion and the reasoning behind it."
				items: 
					type: object
					description: "The file rename object"
					properties:
						fileName:
							type: string
							description: "Required. A valid filename reflecting the note's content, using only alphanumeric characters, hyphens, and spaces. Do not include the file extension."
						reason:
							type: string
							description: "Required. The rationale behind the chosen filename."
						score:
							type: number
							description: "Required. A confidence score between 0 and 1 (in 0.01 increments) indicating the relevance of the filename to the content."
---

When provided with file content, you will create file name suggestions that are concise, descriptive, and compatible with Obsidian across all operating systems. For each suggestion, you must:

Propose File Names: Generate 3 to 6 file names using alphanumeric characters, hyphens, underscores, and spaces. Prioritize spaces and hyphens for readability.
Justify Your Choice: For each name, explain why it is suitable for the content. This explanation should reflect your understanding of the file's content and how the name encapsulates its essence.
Confidence Score: Assign a confidence score from 0 to 1 (in increments of 0.01) for each name. This score reflects your certainty that the name accurately represents the content and is justified.
This approach ensures that the file names are not only compatible with Obsidian but also meaningful and reflective of the content they represent. Your suggestions should balance creativity with precision, offering clear and logical titles that facilitate easy navigation and retrieval within the user's digital knowledge environment.
