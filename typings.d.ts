declare module '*.md' {
	const result: {
	  raw: string;
	  html: string;
	  fileName: string;
	};
	export default result;
  }

  
  declare module '*.svg' {
    const content: string;
    export default content;
}
