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

window.Storage = Storage;
window.UI = UI;
window.Format = Format;
