// const baseApiUrl = "https://de885a4b-d886-4a17-9372-6791449191cc-00-sk4u39m5xe4b.picard.replit.dev:5000"//"https://paper-dash-api.onrender.com";
const baseApiUrl = "https://paper-dash-api.onrender.com"
// const baseApiUrl = "http://localhost:5000"
export const endpoints = {
    bot: {
        socketUrl: "ws://localhost:5000/api/bot",
    },
    paperDashApi: {
        getBook: {
            url: `${baseApiUrl}/api/scraper/getbook`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        validateUrl: {
            url: `${baseApiUrl}/api/scraper/validate-url`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        authenticate: {
            url: `${baseApiUrl}/api/scraper/auth`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        getToken: {
            url: `${baseApiUrl}/api/scraper/token`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        copyCourse: {
            url: `${baseApiUrl}/api/scraper/copy-course`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
    },

    auth: {
        url: `${baseApiUrl}/api/auth/authenticate`,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    },
    getUser: "/api/user",
    updateUser: "/api/user/update",
    deleteUser: "/api/user/delete",
    getUsersList: "/api/users",
    // add more endpoints as needed
};
