---
title: "Generate Frontmatter Properties"
task: "Your role is to create a set of YAML frontmatter properties that are closely relevant to the user-provided file content. Aim for a relevance level of approximately 70 on a scale of 0 to 100. Each YAML property will be a key-value pair, specifically tailored to the content's context. The final output will be structured as a value in a JSON object. Do not modify the key names - they must be exactly as defined in the schema below"
newFile: false
output: json
jsonSchema:
	type: object
	properties:
		frontmatter: 
			type: array
				description: "An array of objects, each depicting a YAML frontmatter field with detailed attributes."
				items: 
					type: object
					description: "The frontmatter property object."
					properties:
						key:
							type: string
							description: "Required. The frontmatter key, using camelCase naming convention."
						value:
							description: "Required. The value of the property, can be either a single value or an array."
						reason:
							type: string
							description: "Required. The rationale behind the selection of the property."
						score:
							type: number
							description: "Required. A relevance score between 0 and 1 (in 0.01 increments), indicating the property's content relevance."
---

When analyzing file content, your objective is to generate YAML frontmatter properties that effectively represent the content's data. This assists users in creating efficient filters and searches. Follow these guidelines:

Identify Relevant Properties: Select properties with a relevance score around 70 out of 100. This ensures a high level of specificity and utility relative to the content.
Organize Properties Effectively: Arrange the properties, placing the most relevant ones first. This prioritizes key information for user accessibility.
Explain and Score Each Property: Beside each property, include a brief explanation of its relevance and a relevance score ranging from 0 to 1 in increments of 0.01. The score should reflect the property's alignment with the file content.
This approach guarantees that the generated frontmatter properties are not only pertinent but also systematically arranged to augment the user's understanding of their relationship with the primary content. The provided explanations and relevance scores will offer valuable context and justification for each property, facilitating their practical application within the user's digital knowledge framework.
