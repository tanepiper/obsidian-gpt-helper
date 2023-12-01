# Digital Gardener - Your GPT Agent in Obsidian

**Version: 0.1.0**

Thank you for checking out the Digital Gardener 🧑🏼‍🌾 For Obsidian.

The Digital Gardener is an _in progress_ tool that connects Obsidian to OpenAI-compatible APIs that drive a set of tools that
both simplfy the life of a user, and enable new forms of knowledge curation to be found and enabled.

You can ask it to find new knowledge, or search existing knowledge to find new connections and properties.

The agent is built upon some fixed queries, along with the future ability to add more customisation through
your own agents and prompts. One of the key values of the digital gardener is to provide flexability when
it comes to configuring how you interact with your agent.

## Plugin Settings

These are the current plugin settings, as the digital gardeners features expand this will change, please be aware if this

| Setting Name         | Default Value    | Description                                                                               |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| OpenAI API Key       | `openAIAPIKey`   | The OpenAI API key to use for requests                                                    |
| Default OpenAI Model | `openAIModel`    | Select the default OpenAI model to use for any requests (can be changed per request)      |
| Temperature          | `oaiTemperature` | Enter the temperature to use when generating text                                         |
| Max Tokens           | `oaiMaxTokens`   | The maximum number of tokens to use when generating text                                  |
| Your Name            | `userName`       | What should I call you?                                                                   |
| Pronouns             | `userPronouns`   | Your pronouns                                                                             |
| Languages            | `userLanguages`  | What languages do you want to work in? Put in a comma-separated list                      |
| User Bio             | `userBio`        | Enter a short bio about yourself, as much or as little as you like                        |
| Root directory       | `rootFolder`     | Select a root directory for your Digital Garden, where all files and notes will be stored |
| Emoji Level          | `emojiLevel`     | How many emojis should it use (None, Low, Some, High)                                     |

## Features

The current features are:

### Generate file from query

Give the agent a query and it will generate a new file in it's notes folder, the file will be named and may contain frontmatter properties with some tags and WikiLinks. In the dialog there are some options you can select, some come from the default values of the plugin.

| Option Name              | Default Value   | Description                                                                             |
| ------------------------ | --------------- | --------------------------------------------------------------------------------------- |
| Personalise Request      | `true`          | Use the personalisation settings from the settings tab to give a more personal response |
| Include Vault File Names | `true`          | Include an object in the query with all markdown file references and file names         |
| Include Tags             | `true`          | Include a comma seperated list of all tags in the vault                                 |
| OpenAI Model             | (from settings) | The OpenAI model to use for this request                                                |
| Temperature              | (from settings) | The temperature setting to use when generating text                                     |
| Max Tokens               | (from settings) | The maximum number of tokens to use when generating text                                |
| Emoji Level              | (from settings) | How many emojis to use in the response (`none`, `low`, `medium`, `high`)                |

### Generate file properties

Takes the contents of the currently opened file and creates frontmatter properties which are applied to the file

### Generate Wiki Links

Takes the contents of the currently opened file, and a list of all files and tags in the vault - and generates a list of WikiLinks, with the reason and a confidence score.

### Rename file from contents

Get one or more filename suggestions for the currently open file and if selected rename the file to the response

## Roadmap

-   [ ] Closer integration with Obsidian for system setup
-   [ ] Standard format for Agent files and custom prompts in Obsidian that allows for more dynamic features
-   [ ] Support different API endpoints than OpenAI
-   [ ] Provide support for different models
-   [ ] Provide better UI for sending requests
-   [ ] Provide application flows that give the user more control over their interactions
-   [ ] Better chat support for sustained conversations with agents
-   [ ] Integrate agents with functions
-   [ ] Support more file types for processing
    [ ] Better state management
-   [ ] A bunch more useful commands and views
