import { App, Modal, ButtonComponent } from "obsidian";
import type { LexicalIssue } from "./types";

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

    contentEl.createEl("h3", { text: "Lexical issues found" });

    const preview = contentEl.createDiv({
      cls: "ai-lexical-preview"
    });

    const frag = this.renderAnchoredFragment();
    preview.appendChild(frag);

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

  private renderAnchoredFragment(): DocumentFragment {
    const fragment = document.createDocumentFragment();

    type Range = { start: number; end: number; issue: LexicalIssue };
    const ranges: Range[] = [];

    for (const issue of this.issues) {
      const needle = issue.text;
      if (!needle) continue;
      let from = 0;
      while (true) {
        const idx = this.original.indexOf(needle, from);
        if (idx === -1) break;
        ranges.push({ start: idx, end: idx + needle.length, issue });
        from = idx + needle.length;
      }
    }

    ranges.sort((a, b) => a.start - b.start || a.end - b.end);
    const merged: Range[] = [];
    for (const r of ranges) {
      const last = merged[merged.length - 1];
      if (!last || r.start >= last.end) merged.push(r);
    }

    let cursor = 0;
    for (const r of merged) {
      if (cursor < r.start) {
        this.appendTextWithLineBreaks(fragment, this.original.slice(cursor, r.start));
      }
      const span = document.createElement("span");
      span.className = "ai-lexical-underline";
      span.title = `${r.issue.message} → ${r.issue.suggestion}`;
      this.appendTextWithLineBreaks(span, this.original.slice(r.start, r.end));
      fragment.appendChild(span);
      cursor = r.end;
    }

    if (cursor < this.original.length) {
      this.appendTextWithLineBreaks(fragment, this.original.slice(cursor));
    }

    return fragment;
  }

  private appendTextWithLineBreaks(parent: DocumentFragment | HTMLElement, text: string) {
    const parts = text.split("\n");
    parts.forEach((part, idx) => {
      parent.appendChild(document.createTextNode(part));
      if (idx < parts.length - 1) parent.appendChild(document.createElement("br"));
    });
  }
}
