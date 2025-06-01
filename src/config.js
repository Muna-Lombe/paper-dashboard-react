const baseApiUrl = "https://paper-dash-api.onrender.com";
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
