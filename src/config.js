export const endpoints = {
    paperDashApi:{
        getBook:{
            url: 'https://paper-dash-api.onrender.com/api/scraper/getbook',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        validateUrl:{
            url: 'https://paper-dash-api.onrender.com/api/scraper/validate-url',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        authenticate:{
            url: 'https://paper-dash-api.onrender.com/api/scraper/auth',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        getToken:{
            url: 'https://paper-dash-api.onrender.com/api/scraper/token',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        copyCourse:{
            url: 'https://paper-dash-api.onrender.com/api/scraper/copy-course',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    },
    
    getUser: '/api/user',
    updateUser: '/api/user/update',
    deleteUser: '/api/user/delete',
    getUsersList: '/api/users',
    // add more endpoints as needed
};

