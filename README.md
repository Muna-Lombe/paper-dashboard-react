# Paper Dashboard React - Course Scraper Edition

This project is a customized version of the Paper Dashboard React template by Creative Tim. It provides a responsive and clean admin dashboard interface, extended with a powerful "Course Scraper" utility designed to interact with the ProgressMe platform.

![Course Scraper Screenshot](https://user-images.githubusercontent.com/12345/some-image-url.png) <!-- It's recommended to replace this with an actual screenshot of your app -->

## Key Features

-   **Modern Admin Dashboard:** A beautiful and fully functional admin panel based on Bootstrap and React.
-   **Course Scraper:** A specialized tool to load, view, and save course materials from ProgressMe links.
    -   Validates ProgressMe URLs.
    -   Fetches and displays book details (ID, Name).
    -   Requires authentication to save course content to a user's account.
    -   Responsive two-column layout for easy interaction on all screen sizes.
-   **State Management:** Utilizes Redux Toolkit for robust and predictable state management.
-   **Dynamic UI:** Components for toast notifications and error alerts to provide real-time user feedback.
-   **Custom Hooks:** Encapsulated logic for authentication (`useAuth`) for reusability and cleaner components.

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later recommended)
-   [pnpm](https://pnpm.io/installation) (you can also use `npm` or `yarn`, but scripts are optimized for `pnpm`)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Muna-Lombe/paper-dashboard-react.git
    cd paper-dashboard-react
    ```

2.  **Install dependencies:**
    ```sh
    pnpm install
    ```

3.  **Configure API Endpoint:**
    The backend API URL is configured in `src/config.js`. Make sure the `baseApiUrl` variable points to your running backend instance.
    ```javascript
    // src/config.js
    const baseApiUrl = "https://paper-dash-api.onrender.com"; // Or your local/dev API URL
    ```

4.  **Run the development server:**
    ```sh
    pnpm run dev
    ```
    The application should now be running on [http://localhost:3000](http://localhost:3000).

## Available Scripts

In the project directory, you can run:

-   `pnpm run dev`: Runs the app in development mode with hot-reloading.
-   `pnpm run build`: Builds the app for production to the `dist` folder.
-   `pnpm run preview`: Serves the production build locally to preview it.
-   `pnpm run lint`: Lints the project files using ESLint.

## Deployment

This project is configured for deployment on platforms like Render or Vercel. The `pnpm run build` command generates a static build in the `dist` directory, which can be served by any static host.

For deployments using `pnpm`, the build command in `package.json` has been updated to `pnpm exec vite build` to ensure the `vite` command is found in CI/CD environments.
