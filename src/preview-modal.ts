import { App, Modal, ButtonComponent } from "obsidian";

export class PreviewModal extends Modal {
  text: string;
  explanation?: string;
  onAccept: () => void;

  constructor(
    app: App,
    text: string,
    explanation: string | undefined,
    onAccept: () => void
  ) {
    super(app);
    this.text = text;
    this.explanation = explanation;
    this.onAccept = onAccept;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h3", { text: "Preview" });

    const textBlock = contentEl.createEl("div", {
      cls: "ai-preview-text"
    });
    textBlock.textContent = this.text;

    if (this.explanation) {
      contentEl.createEl("h4", { text: "Explanation" });
      const exp = contentEl.createEl("div", { cls: "ai-preview-explanation" });
      exp.textContent = this.explanation;
    }

    const buttons = contentEl.createDiv({ cls: "ai-preview-buttons" });

    new ButtonComponent(buttons)
      .setButtonText("Accept")
      .setCta()
      .onClick(() => {
        this.onAccept();
        this.close();
      });

    new ButtonComponent(buttons)
      .setButtonText("Cancel")
      .onClick(() => this.close());
  }
}
