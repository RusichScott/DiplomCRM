const API = 'http://127.0.0.1:3000';

function showModal(message, type, callback) {
    const overlay = document.getElementById('customModal');
    const icon    = document.getElementById('modalIcon');
    const title   = document.getElementById('modalTitle');
    const msg     = document.getElementById('modalMessage');
    const btn     = document.getElementById('modalBtn');

    if (type === 'success') {
        icon.className    = 'fas fa-check-circle';
        title.textContent = 'Успешно!';
    } else {
        icon.className    = 'fas fa-exclamation-circle';
        title.textContent = 'Ошибка';
    }

    msg.textContent = message;
    overlay.classList.add('active');

    btn.onclick = function () {
        overlay.classList.remove('active');
        if (callback) callback();
    };
}

document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const password        = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showModal('Пароли не совпадают!', 'error');
        return;
    }

    const btn = document.querySelector('.btn-register');
    btn.disabled    = true;
    btn.textContent = 'Регистрация...';

    try {
        const res = await fetch(`${API}/auth/register`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: document.getElementById('firstName').value.trim(),
                last_name:  document.getElementById('lastName').value.trim(),
                email:      document.getElementById('regEmail').value.trim(),
                password,
                phone: document.getElementById('phone').value.trim() || undefined
            })
        });

        const data = await res.json();

        if (!res.ok) {
            showModal(data.error || 'Ошибка при регистрации', 'error');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user',  JSON.stringify(data.user));

        showModal(
            'Регистрация успешно завершена! Добро пожаловать в Miestilo.',
            'success',
            () => { window.location.href = '../account/account.html'; }
        );

    } catch (err) {
        showModal('Не удалось подключиться к серверу. Попробуйте позже.', 'error');
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Зарегистрироваться';
    }
});

document.getElementById('phone').addEventListener('input', function (e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    e.target.value = '+7' + (x[2] ? ' (' + x[2] : '') + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
});
