document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const loginError = document.getElementById('login-error');

    emailError.textContent = '';
    passwordError.textContent = '';
    loginError.textContent = '';

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        emailError.textContent = 'Невірний формат емейлу';
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = '/'; // Перехід на головну сторінку після успішного логіну
        } else {
            loginError.textContent = result.error || 'Помилка входу. Спробуйте ще раз.';
        }
    } catch (error) {
        loginError.textContent = 'Сталася помилка при зв\'язку з сервером.';
    }
});