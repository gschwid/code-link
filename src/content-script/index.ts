// This import css file is used to style the iframe that is injected into the page
import "./index.css"
import { name } from "~/package.json"

// Handle parsing logic sent from vue frontend
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "parseLinkedinProfile") {
    console.info("Received message to parse LinkedIn profile 2")
    console.info("Current Window URL Location:", window.location.href)
    const workspace = document.getElementById("workspace") // Actually get scrollbar element
    if (workspace) {
      // Comment out scrolling for now to avoid detection
      // workspace.scrollTop = 0
      // await new Promise((resolve) => {
      //   const waitInterval = 100
      //   const scrollAmount = 200

      //   const timer = setInterval(() => {
      //     // Weird loop needed for scrolling using JS lol
      //     if (
      //       workspace.scrollTop + workspace.clientHeight >=
      //       workspace.scrollHeight
      //     ) {
      //       clearInterval(timer)
      //       resolve(true)
      //     } else {
      //       workspace.scrollTop += scrollAmount
      //     }
      //   }, waitInterval)
      // })

      // Get proper HTML elements after scrolling
      let returnedJson = {}
      const nameQuery = `a[href="${window.location.href}"][aria-haspopup="dialog"] h2`
      const bioQuery = `p`
      const aboutQuery = `span[tabindex="-1"]`
      const featuredAndActivityQuery = `ul[data-testid="carousel-children-container"]`
      // TODO: MAKE THIS CODE GOOD ONCE IT WORKS
      // Get bio elements of profile
      const dotReference = findElementByExactText("p", "·") // Finds known dot element that is used as a separator in the profile
      const bioParent = dotReference?.parentElement?.parentElement
      const location = dotReference?.previousElementSibling
      const name = document.querySelector(nameQuery)
      const bio = bioParent?.querySelectorAll(bioQuery) // Get all bio related elements

      // Filter unimportant bio elements and only keep those that are relevant
      const blockedTexts = [
        "·",
        "Contact info",
        "Follow",
        "Message",
        "· 3rd",
        "· 2nd",
        "· 1st",
        "He/Him",
        "She/Her",
        "They/Them",
      ] // These are all common elements in the bio section that we want to ignore
      const relevantBio = Array.from(bio || []).filter((p) => {
        const text = p.textContent?.trim() || ""
        return (
          text.length > 0 && // Not empty
          !blockedTexts.some((blocked) => text === blocked)
        )
      })

      // Get About section of profile
      const aboutSection = findElementByExactText("h2", "About")
      const aboutParent = aboutSection?.parentElement?.parentElement
      console.info("About parent element:", aboutParent)
      const about = aboutParent?.querySelector(aboutQuery)
      console.info("About element:", about)

      // Get top skills from profile
      const skillsSection = findElementByExactText("p", "Top skills")
      const skills = skillsSection?.nextSibling

      // Get featured section of profile
      const featuredSections = findElementsByExactText("p", "Link")
      console.info("Featured section elements:", featuredSections)
      if (featuredSections.length > 0) {
        returnedJson.featured = []
        featuredSections.forEach((section) => {
          let featured = {}
          console.info("Featured section element:", section)
        })
      }

      // Get Experience section of profile
      const experienceSection = findElementByExactText("h2", "Experience")
      const experienceParent = experienceSection?.parentElement?.parentElement
      const experienceFigure = experienceParent?.querySelectorAll("figure") // Each job experience is stored in a figure element

      returnedJson.jobs = []

      // Go through jobs section
      experienceFigure?.forEach((figure) => {
        const jobSection = figure.closest("div")
        const multiplePositionsSection =
          jobSection?.parentElement?.parentElement?.parentElement
        if (multiplePositionsSection?.querySelector("ul")) {
          // Case where person has worked multiple jobs at one company.
          console.info("found job with multiple postions!")
          const sections = multiplePositionsSection.querySelectorAll("li")
          console.info("sections bitch; ", sections)
          sections.forEach((section) => {
            let job = {}
            console.info("specific section", section)
            const jobInfo = section?.querySelectorAll("p")
            const jobBio = section?.querySelector("span") // Bio data stored in first span
            if (jobInfo?.length != 0) {
              job.name = jobInfo[0]?.innerText // Name is always first
              job.data = []
              jobInfo?.forEach((data) => {
                // Loop through each found element, add it to the data in the job.
                job.data.push(data.innerText)
              })
              job.bio = jobBio?.innerText
              returnedJson.jobs.push(job)
            }
          })
        } else {
          // Case where the company just has one job and thats it
          let job = {}
          const jobInfo = jobSection?.querySelectorAll("p")
          const jobBio = jobSection?.querySelector("span") // Bio data stored in first span
          if (jobInfo?.length != 0) {
            job.name = jobInfo[0]?.innerText // Name is always first
            job.data = []
            jobInfo?.forEach((data) => {
              // Loop through each found element, add it to the data in the job.
              job.data.push(data.innerText)
            })
            job.bio = jobBio?.innerText
            returnedJson.jobs.push(job)
          }
        }
      })

      returnedJson.name = name?.textContent || "Unknown"
      returnedJson.location = location?.textContent || "Unknown"
      returnedJson.bio = relevantBio[0]?.textContent || "Unknown"
      returnedJson.location = relevantBio[2]?.textContent || "Unknown"
      returnedJson.about = about?.textContent || "Unknown"
      returnedJson.skills = skills?.textContent || "Unknown"

      console.info(
        "Finished parsing LinkedIn profile, returning data:",
        returnedJson,
      )
      return Promise.resolve({ success: true })
    }
  }
  return Promise.resolve({ success: false })
})

// Helper function to find an element by its text content
function findElementByText(
  tag: string,
  text: string,
  el: Element | Document = document,
): Element | null {
  const elements = el.querySelectorAll(tag)
  return (
    Array.from(elements).find((el) => el.textContent?.includes(text)) || null
  )
}

// Helper function to find an element by its EXACT text content
function findElementByExactText(
  tag: string,
  text: string,
  el: Element | Document = document,
): Element | null {
  const elements = el.querySelectorAll(tag)
  return (
    Array.from(elements).find((el) => el.textContent?.trim() === text) || null
  )
}

// Helper function to find list of elements by its EXACT text content
function findElementsByExactText(
  tag: string,
  text: string,
  el: Element | Document = document,
): Element[] {
  const elements = el.querySelectorAll(tag)
  return Array.from(elements).filter((el) => el.textContent?.trim() === text)
}

// Checks if current URL matches the LinkedIn profile pattern.
function checkMatch() {
  const regex = /linkedin\.com\/in\/([a-z0-9-]+)\/?/i
  return location.href.match(regex)
}

// Used for correctly injecting the content script when navigating to a user profile on Linkedin
const observer = new MutationObserver(() => {
  if (checkMatch()) {
    if (!document.getElementById("crx-iframe")) {
      // Only inject if it doesn't already exist
      console.info("Matched LinkedIn profile URL, injecting iframe...")
      if (iframe) {
        document.body?.append(iframe)
      }
    }
  } else {
    document.getElementById("crx-iframe")?.remove() // If we navigate away from a profile, remove the iframe
  }
})

observer.observe(document, { subtree: true, childList: true })

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
