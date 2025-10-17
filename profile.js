// Script per la gestione del profilo utente
// Richiede che main.js abbia già definito `Navigation` e `Animations` ed esportato `DOM` tramite window.OculandiaVR.



async function loadProfile() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) { window.location.href = 'login.html'; return; }

        const data = await res.json();
        console.log("1. RAW /api/me →", data);

        // popola interfaccia
        const displayEl = document.getElementById('displayName');
        if (displayEl) displayEl.textContent = data.user?.display_name || data.user?.email || 'User';
        const bioEl = document.getElementById('bioText');
        if (bioEl) bioEl.textContent = data.user?.bio || '';

        // liste
        renderNicknames(data.nicknames || []);
        renderHeadsets(data.headsets || []);
        renderSocials(data.socials || []);
        renderAchievements(data.achievements || []);
        renderFriends(data.friends || []);
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

function renderHeadsets(list) {
  const box = document.getElementById('headsets-list');
  if (!box) return;                 
  box.innerHTML = '';

  if (!list.length) {
    box.innerHTML = '<p class="text-sm text-gray-400">Nessun headset aggiunto.</p>';
    return;
  }


/* ----------  HEADSET  ----------  NON FUNZIONA ANCORA*/
function addHeadset() {
  function showModal(title, content, actions) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  const modalContent = document.createElement('div');
  modalContent.className = 'card-glass rounded-xl p-6 m-4 max-w-sm w-full';

  modalContent.innerHTML = `
    <h3 class="text-xl font-bold mb-4 orbitron">${title}</h3>
    <div class="mb-6">${content}</div>
    <div class="flex space-x-3">
      ${actions.map(act => `<button class="${act.class} flex-1 py-2 px-4 rounded-lg">${act.text}</button>`).join('')}
    </div>
  `;

  // collega gli eventi
  actions.forEach((act, idx) => {
    const btn = modalContent.querySelectorAll('.flex.space-x-3 button')[idx];
    btn.onclick = act.click;
  });

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  anime({
    targets: modalContent,
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 300,
    easing: 'easeOutCubic'
  });
}
}

async function saveHeadset() {
  const model   = document.getElementById('headset-model').value.trim();
  const type    = document.getElementById('headset-type').value.trim();
  const storage = document.getElementById('headset-storage').value.trim();
  const date    = document.getElementById('headset-date').value;

  if (!model) return alert("Seleziona un modello");

  const notes = [type, storage, date].filter(Boolean).join(' • ');

  const res = await fetch('/api/headsets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ model, notes })
  });

  if (!res.ok) {
    const msg = await res.json().then(j => j.error).catch(() => 'Errore');
    return alert(msg);
  }

  const { headsets } = await res.json();
  renderHeadsets(headsets);                       // aggiorna lista
  document.querySelector('.fixed.inset-0').remove(); // chiudi modale
  window.OculandiaVR.DOM.showToast('Visore aggiunto!', 'success');
}
// FINE HEADSETS-----------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  const addBtn = document.getElementById('add-nickname-btn');
  if (addBtn) addBtn.addEventListener('click', addNickname);
});

  list.forEach(h => {
    const div = document.createElement('div');
    div.className = 'headset-card card-glass rounded-lg p-3';
    div.innerHTML = `
      <div class="text-center mb-2">
        <div class="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
          <span class="text-white font-bold">${h.model.substring(0,2).toUpperCase()}</span>
        </div>
        <h4 class="font-semibold text-sm">${h.model}</h4>
        <p class="text-xs text-gray-400">${h.notes || 'Nessuna nota'}</p>
      </div>`;
    box.appendChild(div);
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
