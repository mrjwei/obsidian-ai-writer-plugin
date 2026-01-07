/* eslint-disable obsidianmd/settings-tab/no-problematic-settings-headings */
/* eslint-disable obsidianmd/ui/sentence-case */
import { App, PluginSettingTab, Setting } from "obsidian";
import AIWritingAssistant from "./main";

export class AIWriterSettingTab extends PluginSettingTab {
  plugin: AIWritingAssistant;

  constructor(app: App, plugin: AIWritingAssistant) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("AI writing assistant")
      .setHeading();

    new Setting(containerEl)
      .setName("Openai apikey")
      .setDesc("Stored locally in your vault")
      .addText(text => {
        text.setPlaceholder("sk-...")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async value => {
            this.plugin.settings.apiKey = value.trim();
            await this.plugin.saveSettings();
          });
        text.inputEl.type = "password";
      });
  }
}
