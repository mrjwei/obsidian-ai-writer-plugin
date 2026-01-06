import { App, Modal, ButtonComponent } from "obsidian";

type LexicalIssue = {
  text: string;
  suggestion: string;
  message: string;
};

export class LexicalPreviewModal extends Modal {
  original: string;
  fixed: string;
  issues: LexicalIssue[];
  onAccept: () => void;

  constructor(
    app: App,
    original: string,
    fixed: string,
    issues: LexicalIssue[],
    onAccept: () => void
  ) {
    super(app);
    this.original = original;
    this.fixed = fixed;
    this.issues = issues;
    this.onAccept = onAccept;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h3", { text: "Lexical Issues Found" });

    const preview = contentEl.createDiv({
      cls: "ai-lexical-preview"
    });

    preview.innerHTML = this.renderAnchored();

    const buttons = contentEl.createDiv({ cls: "ai-preview-buttons" });

    new ButtonComponent(buttons)
      .setButtonText("Fix")
      .setCta()
      .onClick(() => {
        this.onAccept();
        this.close();
      });

    new ButtonComponent(buttons)
      .setButtonText("Cancel")
      .onClick(() => this.close());
  }

  renderAnchored(): string {
    let html = this.escape(this.original);

    for (const issue of this.issues) {
      const escaped = this.escape(issue.text);

      const replacement = `<span class="ai-lexical-underline" title="${this.escape(
        issue.message + " → " + issue.suggestion
      )}">${escaped}</span>`;

      html = html.replaceAll(escaped, replacement);
    }

    return html.replace(/\n/g, "<br>");
  }

  escape(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}
