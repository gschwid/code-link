// This import css file is used to style the iframe that is injected into the page
import "./index.css"
import { name } from "~/package.json"

// Handle parsing logic sent from vue frontend
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "parseLinkedinProfile") {
    console.info("Received message to parse LinkedIn profile 2")
    window.scrollTo(0, 0)
    window.scrollTo(0, document.body.scrollHeight) // Scroll to bottom of page to ensure all profile data is loaded

    // console.info("Received message to parse LinkedIn profile ")
    // const cookie = cookieStore.get("JSESSIONID").then((cookie) => { // Get the CSRD token
    //   const cookieValue = cookie?.value?.slice(1, -1) // Remove the quotes around the cookie value
    //   console.info("Retrieved JSESSIONID cookie: ", cookieValue);
    //   fetch("https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(memberIdentity:ACoAACh6w0gBn3Cn51kwJIp7FwHOb1MWcQamkqQ)&queryId=voyagerIdentityDashProfiles.b5c27c04968c409fc0ed3546575b9b7a",
    //     {
    //       method: "GET",
    //       headers: {
    //         "Csrf-Token": cookieValue || "",
    //         }
    //     }
    //   ).then(response => response.json())
    //   .then(data => console.info(data))
    //   .catch(error => console.error("Error fetching profile data: ", error))
    // }).catch((error) => {
    //   console.error("Error retrieving JSESSIONID cookie: ", error);
    // });
    // API call for my profile data.
    // https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(memberIdentity:ACoAACh6w0gBn3Cn51kwJIp7FwHOb1MWcQamkqQ)&queryId=voyagerIdentityDashProfiles.b5c27c04968c409fc0ed3546575b9b7a
    return Promise.resolve({ success: true });
  }
  return Promise.resolve({ success: false });
})

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
