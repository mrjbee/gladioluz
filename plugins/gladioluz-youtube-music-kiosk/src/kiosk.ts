const CDP: any = require('chrome-remote-interface');

export class Kiosk {
    
  async isRunning(): Promise<boolean> {
    try {
      const tabs = await CDP.List();
      return tabs.some((t: any) => t.url.includes('music.youtube.com'));
    } catch {
      return false;
    }
  }

  private async connect() {
    const tabs = await CDP.List();
    const tab = tabs.find((t: any) => t.url.includes('music.youtube.com'));
    if (!tab) throw new Error('YouTube Music tab not found');
    return CDP({ target: tab });
  }

  async playPause(): Promise<string> {
    const client = await this.connect();
    const { Runtime } = client;
    const result = await Runtime.evaluate({
      expression: `
        (() => {
          const btn = document.querySelector('ytmusic-player-bar [title="Pause"], ytmusic-player-bar [title="Play"]');
          if (btn) { btn.click(); return "✅ Play/Pause triggered"; }
          return "❌ Button not found";
        })();
      `
    });
    await client.close();
    return result.result.value;
  }

  async nextTrack(): Promise<string> {
    const client = await this.connect();
    const { Runtime } = client;
    const result = await Runtime.evaluate({
      expression: `
        (() => {
          const btn = document.querySelector('ytmusic-player-bar [title="Next"]');
          if (btn) { btn.click(); return "✅ Next triggered"; }
          return "❌ Next button not found";
        })();
      `
    });
    await client.close();
    return result.result.value;
  }

  async prevTrack(): Promise<string> {
    const client = await this.connect();
    const { Runtime } = client;
    const result = await Runtime.evaluate({
      expression: `
        (() => {
          const btn = document.querySelector('ytmusic-player-bar [title="Previous"]');
          if (btn) { btn.click(); return "✅ Previous triggered"; }
          return "❌ Previous button not found";
        })();
      `
    });
    await client.close();
    return result.result.value;
  }

  async loadRadio(videoId: string): Promise<string> {
    const targetUrl = `https://music.youtube.com/watch?v=${videoId}&list=RD${videoId}`;
    const newTab = await CDP.New({ url: targetUrl });
    const oldTabs = await CDP.List();
    const oldTab = oldTabs.find((t: any) => t.url.includes('music.youtube.com') && t.id !== newTab.id);
    if (oldTab) await CDP.Close({ id: oldTab.id });
    return `✅ Radio loaded: ${targetUrl}`;
  }
}
