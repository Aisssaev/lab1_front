const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const resultsFilePath = path.join(__dirname, "results.json");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());


const clientsFilePath = path.join(__dirname, 'clients.json');

app.get("/", (req, res) => {
    let userId = req.cookies.userId;

    if (!userId) {
        userId = Date.now().toString() + Math.random().toString(36).substring(2);
        res.cookie("userId", userId, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true });
    }

    res.send(`Ваш ID: ${userId}`);
});

function readClientsFile() {
    if (!fs.existsSync(clientsFilePath)) {
        fs.writeFileSync(clientsFilePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(clientsFilePath, 'utf8');
    return JSON.parse(data);
}

app.post("/save-result", (req, res) => {
    const newResult = req.body;

    // Читаємо поточні результати
    fs.readFile(resultsFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Помилка читання файлу:", err);
            return res.status(500).json({ error: "Помилка сервера" });
        }

        const results = data ? JSON.parse(data) : [];
        results.push(newResult);

        // Записуємо оновлений масив у файл
        fs.writeFile(resultsFilePath, JSON.stringify(results, null, 2), (err) => {
            if (err) {
                console.error("Помилка запису у файл:", err);
                return res.status(500).json({ error: "Помилка сервера" });
            }

            res.json({ message: "Результат успішно збережено" });
        });
    });
});

function writeClientsFile(data) {
    fs.writeFileSync(clientsFilePath, JSON.stringify(data, null, 2));
}

app.get('/adminpanel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adminpanel.html'));
});

app.get('/questions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'questions.html'));
});

app.get('/admin', (req, res) => {
    const clients = readClientsFile();
    res.json(clients);
})

app.post('/admin/edit', (req, res) => {
    const updatedClient = req.body;
    const clients = readClientsFile();

    const clientIndex = clients.findIndex(client => client.email === updatedClient.email);
    if (clientIndex !== -1) {
        clients[clientIndex] = updatedClient;
        writeClientsFile(clients);
        res.status(200).send('Клієнт оновлений');
    } else {
        res.status(404).send('Клієнт не знайдений');
    }
});

app.delete('/admin/delete', (req, res) => {
    const { email } = req.query;
    const clients = readClientsFile();

    const updatedClients = clients.filter(client => client.email !== email);
    if (clients.length === updatedClients.length) {
        return res.status(404).send('Клієнт не знайдений');
    }

    writeClientsFile(updatedClients);
    res.status(200).send('Клієнт видалений');
});

app.get('/check-email', (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: "Email не вказано" });
    }

    const clients = readClientsFile();
    console.log(email)
    const emailExists = clients.some(client => client.email === email);
    console.log(emailExists)

    res.json({ exists: emailExists });
});

app.post('/register', (req, res) => {
    const newClient = req.body;
    const clients = readClientsFile();
    bcrypt.hash(newClient.password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: "Помилка при хешуванні пароля" });
        newClient.password = hashedPassword;
        clients.push(newClient);
        writeClientsFile(clients);
        res.status(200).send('Реєстрація успішна!');
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email та пароль обов'язкові" });
    }

    const clients = readClientsFile();
    const client = clients.find(client => client.email === email);

    if (!client) {
        return res.status(404).json({ error: "Користувач не знайдений" });
    }

    bcrypt.compare(password, client.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: "Помилка при перевірці пароля" });
        if (!isMatch) return res.status(401).json({ error: "Невірний пароль" });
        res.cookie("userEmail", email, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        res.status(200).json({ message: "Успішний логін" });
    });

    // Перевірка пароля
    // if (client.password !== password) {
    //     return res.status(401).json({ error: "Невірний пароль" });
    // }

    // Логіка для логування користувача (можна додати cookie або токен для сесії)
    //res.status(200).json({ message: "Успішний логін" });
});

app.get('/check-auth', (req, res) => {
    if (req.cookies.userEmail) {
        res.json({ loggedIn: true, email: req.cookies.userEmail });
    } else {
        res.json({ loggedIn: false });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie("userEmail");
    res.status(200).json({ message: "Вихід успішний" });
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});