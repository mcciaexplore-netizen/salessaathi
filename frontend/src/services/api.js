const API_BASE = '/api';

const handleResponse = async (response) => {
    if (response.status === 401) {
        // Possibly trigger logout or redirect
        return { error: 'Unauthorized', status: 401 };
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
};

export const api = {
    auth: {
        login: (username, password) =>
            fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            }).then(handleResponse),

        logout: () => fetch(`${API_BASE}/auth/logout`, { method: 'POST' }).then(handleResponse),

        me: () => fetch(`${API_BASE}/auth/me`).then(handleResponse),
    },

    dashboard: {
        getSummary: () => fetch(`${API_BASE}/dashboard`).then(handleResponse),
    },

    leads: {
        list: (query = '') => fetch(`${API_BASE}/clients?q=${query}`).then(handleResponse),
        get: (id) => fetch(`${API_BASE}/clients/${id}`).then(handleResponse),
        create: (data) => fetch(`${API_BASE}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        update: (id, data) => fetch(`${API_BASE}/clients/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
    },

    meetings: {
        list: (clientId = '') => fetch(`${API_BASE}/meetings?client_id=${clientId}`).then(handleResponse),
        get: (id) => fetch(`${API_BASE}/meetings/${id}`).then(handleResponse),
        create: (data) => fetch(`${API_BASE}/meetings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        extract: (formData) => fetch(`${API_BASE}/meetings/extract`, {
            method: 'POST',
            body: formData // multipart/form-data
        }).then(handleResponse),
        confirm: (data) => fetch(`${API_BASE}/meetings/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
    },

    settings: {
        getBusiness: () => fetch(`${API_BASE}/business`).then(handleResponse),
        saveBusiness: (data) => fetch(`${API_BASE}/business`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        getKeys: () => fetch(`${API_BASE}/keys`).then(handleResponse),
        addKey: (data) => fetch(`${API_BASE}/keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        deleteKey: (id) => fetch(`${API_BASE}/keys/${id}`, { method: 'DELETE' }).then(handleResponse),
    }
};
