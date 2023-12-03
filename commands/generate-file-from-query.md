---
title: "Generate file from query"
task: "Create a comprehensive and engaging new page in Obsidian. This task involves generating a JSON object that includes the new page's filename, a captivating title, detailed markdown content, and a well-structured frontmatter. The content should be rich in information, offering data about the topic that allows for effective filtering and querying by the user."
newFile: true
output: json
jsonSchema: 
  type: object
  properties:
    filename: 
      type: string
      description: "Required. A valid filename for the note, ensuring it only contains alphanumeric characters, hyphens, and spaces. This will serve as the note's title and identifier."
    title: 
      type: string
      description: "Required. A descriptive and engaging title that correlates with the filename, designed to capture the essence of the note's content."
    agentResponses: 
      type: array
      items: 
        type: string
      description: "Optional. Any additional feedback or commentary from the agent, separate from the main content of the note."
    frontmatter: 
      type: object
      description: "Optional. A YAML-formatted object containing key-value pairs. Key attributes include 'tags' for categorization, 'status' for tracking note progression, 'author' for attribution, and 'creationDate' for historical context."
    frontmatterRaw: 
      type: string
      description: "Optional. The raw text version of the frontmatter, providing a textual representation for direct insertion into the note."
    content: 
      type: string
      description: "Required. The main body of the note, composed in Markdown. This content should be informative, factual, and meticulously structured using Markdown syntax. It should be devoid of agent commentary to maintain factual integrity."
  required: ["filename", "title", "content"]
---

Your task is to generate a JSON object adhering to the schema provided. This object will serve as the blueprint for creating a new file in Obsidian. Ensure to include a relevant file title, comprehensive markdown content, and the necessary frontmatter properties. Optionally, you may also provide agent responses within the JSON structure.

If the user has provided a set of other files and tags, you should analyse the text to find relevant links that are based on the topic being presented.
