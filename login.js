// Script per la pagina di login
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const messageEl = document.getElementById('login-message');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.style.display = 'none';
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                messageEl.textContent = data.error || 'Errore di autenticazione';
                messageEl.style.display = 'block';
            } else {
                // Login ok: reindirizza alla home o profilo
                window.location.href = 'profile.html';
            }
        } catch (err) {
            messageEl.textContent = 'Errore di rete';
            messageEl.style.display = 'block';
        }
    });
});