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
  userPrompt = "";

  private analyzeButton?: HTMLButtonElement;

  constructor(app: App, editor: Editor, settings: AIWriterSettings) {
    super(app);
    this.editor = editor;
    this.settings = settings;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h3", { text: "AI Writing Assistant" });

    // Task dropdown
    new Setting(contentEl)
      .setName("Task")
      .addDropdown(dd =>
        dd
          .addOption("lexical", "Lexical check & fix")
          .addOption("refine", "Refine")
          .addOption("rewrite", "Rewrite")
          .onChange(val => {
            this.action = val as ActionType;
          })
      );

    // Analyze button
    const btnSetting = new Setting(contentEl)
      .setName("Run");

    this.analyzeButton = btnSetting.controlEl.createEl("button", {
      text: "Analyze"
    });
    this.analyzeButton.addClass("mod-cta");
    this.analyzeButton.disabled = false;

    this.analyzeButton.addEventListener("click", () => this.run());

    contentEl.createDiv({
      cls: "ai-selection-notice",
      text: "You must select the text before running the plugin."
    });
  }

  async run() {
    const selection = this.editor.getSelection() ?? "";
    const selectionTrimmed = selection.trim();

    if (!selectionTrimmed) {
      new Notice(
        "You must select the text before running the plugin (select all if you want the entire note)."
      );
      return;
    }

    const result = await runAI({
      text: selectionTrimmed,
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
        selectionTrimmed,
        result.fixedText,
        result.issues,
        () => {
          this.editor.replaceSelection(result.fixedText);
        }
      ).open();
    } else {
      new PreviewModal(
        this.app,
        result.text,
        result.explanation,
        () => {
          this.editor.replaceSelection(result.text);
        }
      ).open();
    }

    this.close();
  }
}
