# BeyondBard - Summary or Insights for Google/YouTube with Google Bard

Chrome extension to view Google Bard summaries alongside Google search results and YouTube videos, also supports Yahoo! ニュース、PubMed、PMC、NewsPicks、Github、Nikkei、 Bing、Google Patents,and any page summary.

## ⚠️ Tips:

Or You can try downloading the experience package ([https://github.com/SingularityLabs-ai/beyond-bard/tree/main/packages](https://github.com/SingularityLabs-ai/beyond-bard/tree/main/packages)) and adding it manually ([https://github.com/SingularityLabs-ai/beyond-bard#chrome](https://github.com/SingularityLabs-ai/beyond-bard#chrome)).

## Supported Websites

- Google
- YouTube
- Yahoo
- PubMed
- PMC
- NewsPicks
- Github
- Nikkei
- Bing
- Google Patents
- Bilibili
- Any website

## Installation

[Add from Chrome Web Store](https://chrome.google.com/webstore/detail/beyond-bard-ai-chat-for-a/ceknbkmhppjloheidfdpmaijdcgofoif?hl=en&authuser=0)

[Add from Mozilla Add-on Store](https://addons.mozilla.org/zh-CN/firefox/addon/beyondbard/)

## Features

- Supports Google search
- Supports YouTube
- Supports Github
- Supports Bing
- Supports Yahoo
- Supports PubMed
- Supports PMC
- Supports NewsPicks
- Supports Nikkei
- Supports Google Patents
- Support bilibili
- Support summary of any web page
- Support for iOS Safari/ macOS Safari
- Supports the official OpenAI API (GPT-3.5-turbo/text-davinci-003)
- Supports Google Plus
- Markdown rendering
- Code highlights
- Dark mode
- Provide feedback to improve Google
- Copy to clipboard
- Switch languages

## Screenshot

### Google

![Screenshot](screenshots/google.png?raw=true)

### YouTube

![Screenshot](screenshots/youtube.png?raw=true)

### Github

![Github](screenshots/github.png?raw=true)

### Bing

![Bing](screenshots/bing.png)

### Google Patents

![Google Patents](screenshots/google_patents.png)

### Yahoo

![Screenshot](screenshots/yahoo.png?raw=true)

## Troubleshooting

### How to make it work in Brave

![Screenshot](screenshots/brave.png?raw=true)

Disable "Prevent sites from fingerprinting me based on my language preferences" in `brave://settings/shields`

## Build from source

1. Clone the repo
2. Install dependencies with `npm`
3. `npm run build`

### Packages

- [Chromium](packages/BeyondBard-chromium.zip)
- [Firefox](packages/BeyondBard-firefox.zip)

### Chrome

1. Go to `chrome://extensions/`.
2. At the top right, turn on `Developer mode`.
3. Click `Load unpacked`.
4. Find and select extension folder(`build/chromium/`).

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click `Load Temporary Add-on`.
3. Find and select the extension file(`build/firefox.zip`).

## Credit

This project is a fork of [wong2/chatgpt-google-extension](https://github.com/wong2/chatgpt-google-extension), and borrows code from [qunash/chatgpt-advanced](https://github.com/qunash/chatgpt-advanced), [sparticleinc/chatgpt-google-summary-extension](https://github.com/sparticleinc/chatgpt-google-summary-extension) & [YouTube Summary with ChatGPT](https://github.com/kazuki-sf/YouTube_Summary_with_ChatGPT)

## License

[GPL-3.0 license](LICENSE).
