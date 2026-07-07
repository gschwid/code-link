import { Octokit } from "octokit"

const octokit = new Octokit({ 
  auth: import.meta.env.VITE_GITHUB_TOKEN 
});

chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  if (opt.reason === "install") {
    chrome.tabs.create({
      active: true,
      // Open the setup page and append `?type=install` to the URL so frontend
      // can know if we need to show the install page or update page.
      url: chrome.runtime.getURL("src/ui/setup/index.html"),
    })

    return
  }

  if (opt.reason === "update") {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("src/ui/setup/index.html?type=update"),
    })
    return
  }
})

// background handles getting github data
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "parseGithubData") {
    console.info("Background script received message to parse github data:", message.data)
    const githubUrl = message.data
  }
})

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from background yoooooo")

export {}
