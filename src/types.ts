export type LexicalIssue = {
  text: string;
  suggestion: string;
  message: string;
};

export type LexicalResult = {
  fixedText: string;
  issues: LexicalIssue[];
};
