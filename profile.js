// Script per la gestione del profilo utente
// Richiede che main.js abbia già definito `Navigation` e `Animations` ed esportato `DOM` tramite window.OculandiaVR.

async function loadProfile() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) {
            // Se non autenticato reindirizza al login
            window.location.href = 'login.html';
            return;
        }
        const data = await res.json();
        const user = data.user || {};
        const profiles = data.profiles || [];
        // Popola nome e bio
        const displayEl = document.getElementById('displayName');
        if (displayEl) displayEl.textContent = user.display_name || user.email || 'User';
        const bioEl = document.getElementById('bioText');
        if (bioEl) bioEl.textContent = user.bio || '';
        renderNicknames(profiles);
    } catch (err) {
        console.error(err);
    }
}

function renderNicknames(profiles) {
    const listEl = document.getElementById('nicknames-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!profiles || profiles.length === 0) {
        const p = document.createElement('p');
        p.className = 'text-sm text-gray-400';
        p.textContent = 'Nessun nickname impostato.';
        listEl.appendChild(p);
        return;
    }
    profiles.forEach((p) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 bg-gray-800 rounded-lg';
        const name = document.createElement('span');
        name.textContent = `${p.platform}: ${p.nickname}`;
        const btn = document.createElement('button');
        btn.textContent = 'Modifica';
        btn.className = 'text-sm text-green-400 hover:underline';
        btn.addEventListener('click', () => {
            // riempie i campi per modifica
            const platformSelect = document.getElementById('nickname-platform');
            const input = document.getElementById('nickname-input');
            platformSelect.value = p.platform;
            input.value = p.nickname;
        });
        div.appendChild(name);
        div.appendChild(btn);
        listEl.appendChild(div);
    });
}

async function addNickname() {
    const platform = document.getElementById('nickname-platform').value;
    const nickname = document.getElementById('nickname-input').value.trim();
    if (!platform || !nickname) {
        window.OculandiaVR.DOM.showToast('Piattaforma o nickname mancante', 'error');
        return;
    }
    try {
        const res = await fetch('/api/profile/nickname', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ platform, nickname })
        });
        const data = await res.json();
        if (!res.ok) {
            window.OculandiaVR.DOM.showToast(data.error || 'Errore salvataggio', 'error');
        } else {
            window.OculandiaVR.DOM.showToast('Nickname salvato!', 'success');
            renderNicknames(data.profiles);
            // Reset input
            document.getElementById('nickname-input').value = '';
            document.getElementById('nickname-platform').value = '';
        }
    } catch (err) {
        window.OculandiaVR.DOM.showToast('Errore di rete', 'error');
    }
}

// Override funzioni esistenti per modificare bio e profilo
function editBio() {
    const current = document.getElementById('bioText').textContent;
    const nuovaBio = prompt('Modifica la tua bio', current || '');
    if (nuovaBio === null) return;
    fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bio: nuovaBio })
    }).then((res) => {
        if (res.ok) {
            document.getElementById('bioText').textContent = nuovaBio;
            window.OculandiaVR.DOM.showToast('Bio aggiornata!', 'success');
        } else {
            window.OculandiaVR.DOM.showToast('Errore aggiornamento bio', 'error');
        }
    }).catch(() => window.OculandiaVR.DOM.showToast('Errore di rete', 'error'));
}

function editProfile() {
    const current = document.getElementById('displayName').textContent;
    const nuovoNome = prompt('Modifica il tuo nome visualizzato', current || '');
    if (nuovoNome === null) return;
    fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ display_name: nuovoNome })
    }).then((res) => {
        if (res.ok) {
            document.getElementById('displayName').textContent = nuovoNome;
            window.OculandiaVR.DOM.showToast('Nome aggiornato!', 'success');
        } else {
            window.OculandiaVR.DOM.showToast('Errore aggiornamento nome', 'error');
        }
    }).catch(() => window.OculandiaVR.DOM.showToast('Errore di rete', 'error'));
}

// Al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    const addBtn = document.getElementById('add-nickname-btn');
    if (addBtn) addBtn.addEventListener('click', addNickname);
});
