
const baseApiUrl = import.meta.env.VITE_API_URL;
const wsUrl = import.meta.env.VITE_WS_URL;


export const endpoints = {
    bot: {
        socketUrl: `${wsUrl}/api/bot`,
    },
    paperDashApi: {
        authenticateUser: {
             url: `${baseApiUrl}/api/scraper/getUserInfo`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
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
        copyCourse: {
            url: `${baseApiUrl}/api/scraper/copy-course`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
    },

    auth: {
        login: {
            url: `${baseApiUrl}/api/auth/login`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        register: {
            url: `${baseApiUrl}/api/auth/register`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        onboarding: {
            url: `${baseApiUrl}/api/auth/onboarding`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        verifyEmail: {
            url: `${baseApiUrl}/api/auth/verify-email`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        resendVerification: {
            url: `${baseApiUrl}/api/auth/resend-verification`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        logout: {
            url: `${baseApiUrl}/api/auth/logout`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
    
    },

    user: {
        profile: {
            get: {
                url: `${baseApiUrl}/api/user/profile`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
            update: {
                url: `${baseApiUrl}/api/user/profile`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
            password: {
                update: {
                    url: `${baseApiUrl}/api/user/password`,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                },
            },
            delete: {
                url: `${baseApiUrl}/api/user/profile`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        },
    },

    dashboard: {
        summary: {
            url: `${baseApiUrl}/api/dashboard/summary`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        calendarEvents: {
            url: `${baseApiUrl}/api/dashboard/calendar-events`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        studentRequests: {
            get: {
                url: `${baseApiUrl}/api/dashboard/student-requests`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
            approve: (id) => ({
                url: `${baseApiUrl}/api/dashboard/student-requests/${id}/approve`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }),
            reject: (id) => ({
                url: `${baseApiUrl}/api/dashboard/student-requests/${id}/reject`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }),
        },
    },

    schedule: {
        save: {
            url: `${baseApiUrl}/api/schedule`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        get: {
            url: `${baseApiUrl}/api/schedule`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
    },

    courses: {
        create: {
            url: `${baseApiUrl}/api/courses`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        get: (courseId) => ({
            url: `${baseApiUrl}/api/courses/${courseId}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }),
        update: (courseId) => ({
            url: `${baseApiUrl}/api/courses/${courseId}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }),
        delete: (courseId) => ({
            url: `${baseApiUrl}/api/courses/${courseId}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }),
        blocks: {
            add: (courseId) => ({
                url: `${baseApiUrl}/api/courses/${courseId}/blocks`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }),
            update: (courseId, blockId) => ({
                url: `${baseApiUrl}/api/courses/${courseId}/blocks/${blockId}`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }),
            delete: (courseId, blockId) => ({
                url: `${baseApiUrl}/api/courses/${courseId}/blocks/${blockId}`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }),
        },
        corrections: {
            add: (courseId) => ({
                url: `${baseApiUrl}/api/courses/${courseId}/corrections`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }),
            update: (courseId, correctionId) => ({
                url: `${baseApiUrl}/api/courses/${courseId}/corrections/${correctionId}`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }),
            delete: (courseId, correctionId) => ({
                url: `${baseApiUrl}/api/courses/${courseId}/corrections/${correctionId}`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }),
        },
    },

    integrations: {
        get: {
            url: `${baseApiUrl}/api/integrations`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        add: {
            url: `${baseApiUrl}/api/integrations`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        update: (id) => ({
            url: `${baseApiUrl}/api/integrations/${id}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }),
        delete: (id) => ({
            url: `${baseApiUrl}/api/integrations/${id}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }),
    },

    assistant: {
        tools: {
            url: `${baseApiUrl}/api/assistant/tools`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        process: {
            url: `${baseApiUrl}/api/assistant/process`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
    },

    telegramBot: {
        registerRequest: {
            url: `${baseApiUrl}/api/telegram/register-request`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        approveRequest: {
            url: `${baseApiUrl}/api/telegram/approve-request`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        rejectRequest: {
            url: `${baseApiUrl}/api/telegram/reject-request`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
    },
};
