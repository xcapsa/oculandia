// Script per la gestione degli amici su Oculandia VR

async function loadFriends() {
    try {
        const res = await fetch('/api/friends', { credentials: 'include' });
        if (!res.ok) {
            // Se non autenticato, rimanda a login
            window.location.href = 'login.html';
            return;
        }
        const data = await res.json();
        renderFriendsList(data.friends);
        renderRequestsList(data.requests);
    } catch (err) {
        console.error(err);
    }
}

function renderFriendsList(friends) {
    const listEl = document.getElementById('friends-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!friends || friends.length === 0) {
        const p = document.createElement('p');
        p.className = 'text-sm text-gray-400';
        p.textContent = 'Nessun amico ancora.';
        listEl.appendChild(p);
        return;
    }
    friends.forEach((f) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 bg-gray-800 rounded-lg';
        const name = document.createElement('span');
        name.textContent = f.display_name;
        div.appendChild(name);
        listEl.appendChild(div);
    });
}

function renderRequestsList(requests) {
    const listEl = document.getElementById('friend-requests');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!requests || requests.length === 0) {
        const p = document.createElement('p');
        p.className = 'text-sm text-gray-400';
        p.textContent = 'Nessuna richiesta in sospeso.';
        listEl.appendChild(p);
        return;
    }
    requests.forEach((req) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 bg-gray-800 rounded-lg';
        const name = document.createElement('span');
        name.textContent = req.display_name;
        const actions = document.createElement('div');
        actions.className = 'space-x-2';
        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Accetta';
        acceptBtn.className = 'btn-primary px-3 py-1 rounded text-xs';
        acceptBtn.addEventListener('click', () => respondRequest(req.id, 'accept'));
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Rifiuta';
        rejectBtn.className = 'btn-secondary px-3 py-1 rounded text-xs';
        rejectBtn.addEventListener('click', () => respondRequest(req.id, 'reject'));
        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);
        div.appendChild(name);
        div.appendChild(actions);
        listEl.appendChild(div);
    });
}

async function respondRequest(requestId, action) {
    try {
        const res = await fetch('/api/friends/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ request_id: requestId, action })
        });
        if (res.ok) {
            window.OculandiaVR.DOM.showToast(action === 'accept' ? 'Amico aggiunto!' : 'Richiesta rifiutata', 'success');
            loadFriends();
        } else {
            const data = await res.json();
            window.OculandiaVR.DOM.showToast(data.error || 'Errore richiesta', 'error');
        }
    } catch (err) {
        window.OculandiaVR.DOM.showToast('Errore di rete', 'error');
    }
}

let searchTimeout;
function onSearchInput(e) {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (query.length === 0) {
            clearSearchResults();
        } else {
            searchUsers(query);
        }
    }, 300);
}

function clearSearchResults() {
    const resultsEl = document.getElementById('search-results');
    if (resultsEl) resultsEl.innerHTML = '';
}

async function searchUsers(query) {
    try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = 'login.html';
            }
            clearSearchResults();
            return;
        }
        const data = await res.json();
        renderSearchResults(data.users || []);
    } catch (err) {
        console.error(err);
    }
}

function renderSearchResults(users) {
    const resultsEl = document.getElementById('search-results');
    if (!resultsEl) return;
    resultsEl.innerHTML = '';
    if (users.length === 0) {
        const p = document.createElement('p');
        p.className = 'text-sm text-gray-400';
        p.textContent = 'Nessun risultato.';
        resultsEl.appendChild(p);
        return;
    }
    users.forEach((u) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 bg-gray-800 rounded-lg';
        const name = document.createElement('span');
        name.textContent = u.display_name;
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Aggiungi';
        addBtn.className = 'btn-primary px-3 py-1 rounded text-xs';
        addBtn.addEventListener('click', () => sendFriendRequest(u.id));
        div.appendChild(name);
        div.appendChild(addBtn);
        resultsEl.appendChild(div);
    });
}

async function sendFriendRequest(userId) {
    try {
        const res = await fetch('/api/friends/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ to_user_id: userId })
        });
        const data = await res.json();
        if (!res.ok) {
            window.OculandiaVR.DOM.showToast(data.error || 'Errore invio richiesta', 'error');
        } else {
            window.OculandiaVR.DOM.showToast('Richiesta inviata!', 'success');
            clearSearchResults();
        }
    } catch (err) {
        window.OculandiaVR.DOM.showToast('Errore di rete', 'error');
    }
}

// Inizializzazione della pagina
document.addEventListener('DOMContentLoaded', () => {
    loadFriends();
    const searchInput = document.getElementById('friend-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', onSearchInput);
    }
});
