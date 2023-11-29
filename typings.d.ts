declare module '*.md' {
	const result: {
	  raw: string;
	  html: string;
	  fileName: string;
	};
	export default result;
  }
