const API = 'http://localhost:3000';

const togglePassword = document.getElementById('togglePassword');
const passwordInput  = document.getElementById('password');
const eyeIcon        = togglePassword.querySelector('i');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');
});

const loginForm     = document.getElementById('loginForm');
const emailInput    = document.getElementById('email');
const emailError    = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    let valid = true;

    if (!validateEmail(emailInput.value)) {
        emailError.style.display    = 'block';
        emailInput.style.borderColor = '#e74c3c';
        valid = false;
    } else {
        emailError.style.display    = 'none';
        emailInput.style.borderColor = '';
    }

    if (passwordInput.value.length < 6) {
        passwordError.style.display    = 'block';
        passwordInput.style.borderColor = '#e74c3c';
        valid = false;
    } else {
        passwordError.style.display    = 'none';
        passwordInput.style.borderColor = '';
    }

    if (!valid) return;

    const loginBtn = document.querySelector('.btn-login');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
    loginBtn.disabled  = true;

    try {
        const res = await fetch(`${API}/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email:    emailInput.value.trim(),
                password: passwordInput.value
            })
        });

        const data = await res.json();

        if (!res.ok) {
            passwordError.textContent       = data.error || 'Неверный email или пароль';
            passwordError.style.display     = 'block';
            passwordInput.style.borderColor = '#e74c3c';
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user',  JSON.stringify(data.user));

        if (document.getElementById('rememberMe').checked) {
            localStorage.setItem('rememberEmail', emailInput.value.trim());
        } else {
            localStorage.removeItem('rememberEmail');
        }

        window.location.href = '../account/account.html';

    } catch (err) {
        passwordError.textContent   = 'Не удалось подключиться к серверу';
        passwordError.style.display = 'block';
    } finally {
        loginBtn.innerHTML = 'Войти';
        loginBtn.disabled  = false;
    }
});

document.getElementById('forgotPasswordLink').addEventListener('click', function (e) {
    e.preventDefault();
    const email = prompt('Введите ваш email для восстановления пароля:');
    if (email && validateEmail(email)) {
        alert(`Инструкция по восстановлению пароля отправлена на ${email}`);
    } else if (email) {
        alert('Пожалуйста, введите корректный email');
    }
});

window.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('rememberEmail');
    if (saved) {
        emailInput.value = saved;
        document.getElementById('rememberMe').checked = true;
    }
});

document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', function () {
        const provider = this.classList.contains('vk') ? 'ВКонтакте' :
                         this.classList.contains('google') ? 'Google' : 'Яндекс';
        alert(`Вход через ${provider} (в демо-версии не реализован)`);
    });
});
