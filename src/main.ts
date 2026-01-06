import { Plugin, MarkdownView, Notice } from "obsidian";
import { AIWriterSettings, DEFAULT_SETTINGS } from "./settings";
import { AIWriterSettingTab } from "./settings-tab";
import { AIActionModal } from "./modal";

export default class AIWritingAssistant extends Plugin {
  settings: AIWriterSettings;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon("wand", "AI Writing Assistant", () => {
      this.openModal();
    });

    this.addCommand({
      id: "open-ai-writing-assistant",
      name: "Open AI Writing Assistant",
      editorCallback: () => this.openModal()
    });

    this.addSettingTab(new AIWriterSettingTab(this.app, this));
    this.registerStyles();
  }

  registerStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .ai-lexical-highlight {
        background-color: rgba(100, 200, 100, 0.35);
      }
    `;
    document.head.appendChild(style);
  }

  openModal() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice("No active editor.");
      return;
    }

    if (!this.settings.apiKey) {
      new Notice("Please set your OpenAI API key in settings.");
      return;
    }

    new AIActionModal(this.app, view.editor, this.settings).open();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
