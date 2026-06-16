const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks      = document.querySelector('.nav-links');

mobileMenuBtn?.addEventListener('click', () => {
    const active = navLinks.classList.toggle('active');
    const icon   = mobileMenuBtn.querySelector('i');
    icon.className = active ? 'fas fa-times' : 'fas fa-bars';
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks?.classList.remove('active');
        const icon = mobileMenuBtn?.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
    });
});

const accountBtn    = document.getElementById('accountBtn');
const loginDropdown = document.getElementById('loginDropdown');
let dropdownTimeout;

accountBtn?.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        window.location.href = '../login/login.html';
        return;
    }
});

accountBtn?.addEventListener('mouseenter', () => {
    if (window.innerWidth <= 768) return;
    clearTimeout(dropdownTimeout);
    loginDropdown?.classList.add('active');
});

loginDropdown?.addEventListener('mouseenter', () => clearTimeout(dropdownTimeout));

accountBtn?.addEventListener('mouseleave', () => {
    dropdownTimeout = setTimeout(() => loginDropdown?.classList.remove('active'), 300);
});

loginDropdown?.addEventListener('mouseleave', () => {
    if (loginDropdown.contains(document.activeElement)) return;
    dropdownTimeout = setTimeout(() => loginDropdown?.classList.remove('active'), 300);
});

loginDropdown?.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => clearTimeout(dropdownTimeout));
    input.addEventListener('blur', () => {
        if (!loginDropdown.matches(':hover'))
            dropdownTimeout = setTimeout(() => loginDropdown?.classList.remove('active'), 300);
    });
});

document.getElementById('goToLoginPage')?.addEventListener('click', () => {
    window.location.href = '../login/login.html';
});

document.getElementById('registerLink')?.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '../registration/registration.html';
});
