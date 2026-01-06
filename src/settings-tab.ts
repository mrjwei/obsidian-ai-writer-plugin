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

    containerEl.createEl("h3", { text: "AI Writing Assistant" });

    new Setting(containerEl)
      .setName("OpenAI API Key")
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
