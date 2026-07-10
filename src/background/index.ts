import { Octokit } from "octokit"

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN, // ADD authentication later down the line with github.
})

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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "parseGithubData") {
    console.info(
      "Background script received message to parse github data:",
      message.data,
    )

    const githubUrl = message.data
    const githubUsername = githubUrl.split("/")[3]
    console.info("Extracted GitHub username:", githubUsername)

    // Self-executing async function to handle the promises inside the listener
    ;(async () => {
      try {
        const repos = await octokit.request("GET /users/{username}/repos", {
          username: githubUsername,
          headers: {
            "X-GitHub-Api-Version": "2026-03-10",
          },
        })

        // 1. Use Promise.all + map so JavaScript actually waits for the loop to finish
        const returnedData = await Promise.all(
          repos.data.map(async (repo) => {
            const repoName = repo.name

            const readme = await octokit.request(
              "GET /repos/{owner}/{repo}/contents/{path}",
              {
                owner: githubUsername,
                repo: repoName,
                path: "README.md",
                headers: { "X-GitHub-Api-Version": "2026-03-10" },
              },
            )

            const languages = await octokit.request(
              "GET /repos/{owner}/{repo}/languages",
              {
                owner: githubUsername,
                repo: repoName,
                headers: { "X-GitHub-Api-Version": "2026-03-10" },
              },
            )

            return {
              name: repoName,
              readme: atob(readme.data.content),
              languages: languages.data,
            }
          }),
        )

        // 2. This will now log perfectly with all your data populated!
        console.info("Returning data to content script:", returnedData)

        // 3. Send the data back to the content script
        sendResponse({ success: true, data: returnedData })
      } catch (error) {
        console.error("Error fetching GitHub data:", error)
        sendResponse({ success: false, error: error.message })
      }
    })()

    // 4. CRITICAL: Return true to tell Chrome you will call sendResponse asynchronously
    return true
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
