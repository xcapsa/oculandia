// Script per la pagina di registrazione
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const messageEl = document.getElementById('register-message');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.style.display = 'none';
        const email = document.getElementById('reg-email').value.trim();
        const display_name = document.getElementById('reg-display-name').value.trim();
        const password = document.getElementById('reg-password').value;
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, display_name, password })
            });
            const data = await res.json();
            if (!res.ok) {
                messageEl.textContent = data.error || 'Errore registrazione';
                messageEl.style.display = 'block';
            } else {
                // Registrazione ok: reindirizza al profilo
                window.location.href = 'profile.html';
            }
        } catch (err) {
            messageEl.textContent = 'Errore di rete';
            messageEl.style.display = 'block';
        }
    });
});