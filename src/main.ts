import { Plugin, MarkdownView, Notice } from "obsidian";
import { AIWriterSettings, DEFAULT_SETTINGS } from "./settings";
import { AIWriterSettingTab } from "./settings-tab";
import { AIActionModal } from "./modal";

export default class AIWritingAssistant extends Plugin {
  settings: AIWriterSettings;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon("wand", "AI writing assistant", () => {
      this.openModal();
    });

    this.addCommand({
      id: "open-writing-assistant",
      name: "Open writing assistant",
      editorCallback: () => this.openModal()
    });

    this.addSettingTab(new AIWriterSettingTab(this.app, this));
  }

  openModal() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice("No active editor.");
      return;
    }

    const selection = view.editor.getSelection()?.trim() ?? "";
    if (!selection) {
      new Notice(
        "You must select the text before running the plugin (select all if you want the entire note)."
      );
      return;
    }

    if (!this.settings.apiKey) {
      new Notice("Please set your openai apikey in settings.");
      return;
    }

    new AIActionModal(this.app, view.editor, this.settings).open();
  }

  async loadSettings() {
    const data: unknown = await this.loadData();
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (typeof data === "object" && data !== null ? (data as Partial<AIWriterSettings>) : {})
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
