/**
 * Utility functions for HostelMart
 */

const Storage = {
    get: (key, defaultValue = []) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error reading ${key} from localStorage`, e);
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error saving ${key} to localStorage`, e);
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

const UI = {
    showModal: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },
    hideModal: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
};

const Format = {
    currency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }
};

const Cookie = {
    set: (name, value, days = 30) => {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        // Configure options from central CONFIG simulator safely
        const config = window.CONFIG || {};
        const secure = config.COOKIE_SECURE ? "; Secure" : "";
        const sameSite = config.COOKIE_SAME_SITE ? "; SameSite=" + config.COOKIE_SAME_SITE : "; SameSite=Lax";
        document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/" + secure + sameSite;
    },
    get: (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    },
    remove: (name) => {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    }
};

window.Storage = Storage;
window.UI = UI;
window.Format = Format;
window.Cookie = Cookie;
