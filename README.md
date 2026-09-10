# Binaire FreznelAI Assessment: Model Selection Utility

This repository contains the Model Selection Utility built for the Binaire FreznelAI assessment. The application is built using React and standard JavaScript, utilizing `@adobe/react-spectrum` for accessible UI components and custom CSS for a modern aesthetic.

## Local Setup

To run the application locally:

1. Ensure Node.js is installed.
2. Clone the repository.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:5173`.

---

## Technical Implementations

### 1. Data Fetching (Without Async/Await)

The `fetch` API is utilized using native Promises (`.then()` and `.catch()`). This approach maintains non-blocking, asynchronous behavior while avoiding `async/await` syntax. 

Network requests are initiated and resolved in a standard promise chain. If the response is successful, the JSON is parsed and cached. If the request fails, the `.catch()` block provides a fallback mechanism to load cached data.

### 2. Large JSON Payload Handling & Corruption Prevention

To safely handle potentially large JSON downloads and prevent application crashes from corrupted or incomplete payloads, a two-step validation is used:

1. **Strict Parsing:** The `JSON.parse()` execution is wrapped in a `try...catch` block. If the payload is truncated or malformed due to network instability, the parser throws an error instead of failing silently or crashing the runtime.
2. **Graceful Fallback:** If a parsing error is caught, the promise rejects safely and falls back to pulling the last known valid dataset from `localStorage`. The UI remains stable regardless of the download state.

---

## Features

- **Authentication:** Email/Password authentication flow integrated with Firebase.
- **Offline Mode:** Connection state listeners automatically toggle a UI indicator and switch to locally cached data if the network drops.
- **Search:** Debounced input matching against model names and families (supports both exact prefix and substring matching).
- **Filtering & Sorting:** Multi-dimensional filtering (Pipeline, Family, Architecture, Weight Format, Safetensor range) managed via an encapsulated `ModelDirectory` utility class.
