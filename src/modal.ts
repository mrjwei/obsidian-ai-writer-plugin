import { App, Editor, Modal, Setting, Notice } from "obsidian";
import { runAI } from "./ai";
import { PreviewModal } from "./preview-modal";
import { LexicalPreviewModal } from "./lexical-preview-modal";
import { AIWriterSettings } from "./settings";

type ActionType = "lexical" | "refine" | "rewrite";

export class AIActionModal extends Modal {
  editor: Editor;
  settings: AIWriterSettings;

  action: ActionType = "lexical";
  preset = "";
  userPrompt = "";

  constructor(app: App, editor: Editor, settings: AIWriterSettings) {
    super(app);
    this.editor = editor;
    this.settings = settings;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h3", { text: "AI Writing Assistant" });

    new Setting(contentEl)
      .setName("Task")
      .addDropdown(dd =>
        dd
          .addOption("lexical", "Lexical check & fix")
          .addOption("refine", "Refine")
          .addOption("rewrite", "Rewrite")
          .onChange(val => (this.action = val as ActionType))
      );

    new Setting(contentEl)
      .setName("Run")
      .addButton(btn =>
        btn
          .setButtonText("Analyze")
          .setCta()
          .onClick(() => this.run())
      );
  }

  async run() {
    const selected = this.editor.getSelection();
    const originalText = selected || this.editor.getValue();

    new Notice("AI is analyzing…");

    const result = await runAI({
      text: originalText,
      action: this.action,
      apiKey: this.settings.apiKey
    });

    if (!result) {
      new Notice("No response from AI.");
      return;
    }

    if (this.action === "lexical") {
      new LexicalPreviewModal(
        this.app,
        originalText,
        result.fixedText,
        result.issues,
        () => {
          if (selected) {
            this.editor.replaceSelection(result.fixedText);
          } else {
            this.editor.setValue(result.fixedText);
          }
        }
      ).open();
    } else {
      new PreviewModal(
        this.app,
        result.text,
        result.explanation,
        () => {
          if (selected) {
            this.editor.replaceSelection(result.text);
          } else {
            this.editor.setValue(result.text);
          }
        }
      ).open();
    }

    this.close();
  }
}
