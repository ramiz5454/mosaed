document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const errorMsgDiv = document.getElementById('error-msg');

    const handleResponse = (response) => {
        errorMsgDiv.classList.add('hidden');
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message) });
        }
        return response.json();
    };

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(handleResponse)
            .then(data => {
                alert(data.message);
                window.location.href = 'login.html';
            })
            .catch(err => {
                errorMsgDiv.textContent = err.message;
                errorMsgDiv.classList.remove('hidden');
            });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(handleResponse)
            .then(data => {
                localStorage.setItem('token', data.token);
                window.location.href = 'tool.html';
            })
            .catch(err => {
                errorMsgDiv.textContent = err.message;
                errorMsgDiv.classList.remove('hidden');
            });
        });
    }
});