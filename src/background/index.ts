let currentProfile = "" // Used so content injection doesnt happen multiple times when user is on the same linkedin profile and just refreshing the page. 

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

// Functionality for user inspecting a linkedin page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const regex = /linkedin\.com\/in\/([a-z0-9-]+)\/?/i;
  if (tab.url && (tab.url?.match(regex)) && (tab.url?.match(regex))[1] != currentProfile) {
    console.info("On profile for" + tab.url)
    currentProfile = tab.url.match(regex)[1]
    console.info("Current profile: " + currentProfile)
    // Create content page that appears on website.
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
