// This import css file is used to style the iframe that is injected into the page
import "./index.css"
import { name } from "~/package.json"

// Checks if current URL matches the LinkedIn profile pattern.
function checkMatch() {
  const regex = /linkedin\.com\/in\/([a-z0-9-]+)\/?/i;
  return location.href.match(regex)
}

// Used for correctly injecting the content script when navigating to a user profile on Linkedin
const observer = new MutationObserver(() => {
  if (checkMatch()) {
    if (!document.getElementById("crx-iframe")) { // Only inject if it doesn't already exist
      console.info("Matched LinkedIn profile URL, injecting iframe...")
      if (iframe) {
        document.body?.append(iframe)
      }
    }
  }
  else {
    document.getElementById("crx-iframe")?.remove() // If we navigate away from a profile, remove the iframe
  }
})

observer.observe(document, { subtree: true, childList: true });

// Normal injection setup.
const src = chrome.runtime.getURL("src/ui/content-script-iframe/index.html")

const iframe = new DOMParser().parseFromString(
  `<iframe id="crx-iframe" class="crx-iframe ${name}" src="${src}" title="${name}"></iframe>`,
  "text/html",
).body.firstElementChild

if (iframe && checkMatch()) {
  document.body?.append(iframe)
}

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from content script")
