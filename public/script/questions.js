document.addEventListener("DOMContentLoaded", () => {
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let score = 0;
    let questions = [];
    let isTestFinished = false;

    const h1 = document.createElement("h1")
    h1.innerText = "Перевір свої знання"
    document.body.appendChild(h1)

    const questionNav = document.createElement("div")
    questionNav.id = "question-nav"
    questionNav.classList.add("question-nav")
    document.body.appendChild(questionNav)

    const p = document.createElement("p")
    p.innerText = "Перехід по тесту"
    document.getElementById(questionNav.id).appendChild(p)

    const questionButtons = document.createElement("div")
    questionButtons.id = "question-buttons"
    questionButtons.classList.add("question-buttons")
    document.getElementById(questionNav.id).appendChild(questionButtons)

    const questionContainer = document.createElement("div")
    questionContainer.id = "question-container"
    questionContainer.classList.add("question-container")
    document.body.appendChild(questionContainer)

    const h2 = document.createElement("h2")
    h2.id = "question"
    h2.innerText = "Завантаження питання..."
    document.getElementById(questionContainer.id).appendChild(h2)

    const imageContainer = document.createElement("div")
    imageContainer.id = "image-container"
    document.getElementById(questionContainer.id).appendChild(imageContainer)

    const options = document.createElement("div")
    options.id = "options"
    document.getElementById(questionContainer.id).appendChild(options)

    const navigation = document.createElement("div")
    navigation.id = "navigation"
    navigation.classList.add("navigation")
    document.body.appendChild(navigation)

    const nextButton = document.createElement("button")
    nextButton.id = "next-btn"
    nextButton.innerText = "Наступне питання"
    document.getElementById(navigation.id).appendChild(nextButton)

    const finishButton = document.createElement("button")
    finishButton.id = "finish-btn"
    finishButton.innerText = "Завершити тест"
    finishButton.style.display = "none"
    document.getElementById(navigation.id).appendChild(finishButton)

    const h3 = document.createElement("h3")
    h3.id = "result"
    h3.style.display = "none"
    document.body.appendChild(h3)


    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            questions = data;
            createNavigationButtons();
            showQuestion();
        });


    function createNavigationButtons() {
        const container = document.getElementById("question-buttons");
        container.innerHTML = "";

        questions.forEach((_, index) => {
            const button = document.createElement("button");
            button.innerText = index + 1;
            button.classList.add("question-btn");

            button.addEventListener("click", () => {
                currentQuestionIndex = index;
                showQuestion();
            });

            container.appendChild(button);
        });

        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        const buttons = document.querySelectorAll(".question-btn");

        buttons.forEach((button, index) => {
            button.classList.remove("active", "answered");

            if (index === currentQuestionIndex) {
                button.classList.add("active");
            }

            if (userAnswers[index] !== undefined) {
                button.classList.add("answered");
            }
        });
    }

    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            return;
        }

        const question = questions[currentQuestionIndex];
        document.getElementById("question").innerText = question.question;

        const imageContainer = document.getElementById("image-container");
        imageContainer.innerHTML = `<img src="/img/${question.svg}" alt="Фігура" width="150">`;

        const optionsContainer = document.getElementById("options");
        optionsContainer.innerHTML = "";

        question.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.innerText = option;
            button.classList.add("option-btn");

            // Позначаємо активну відповідь
            if (userAnswers[currentQuestionIndex] === index) {
                button.classList.add("selected");
            }

            if (isTestFinished) {
                // Приховуємо варіанти відповідей після завершення тесту
                button.style.display = "none";
                if (index === question.correct) {
                    button.classList.add("correct");
                } else if (index === userAnswers[currentQuestionIndex]) {
                    button.classList.add("incorrect");
                }
            } else {
                button.onclick = () => selectAnswer(button, index);
            }

            optionsContainer.appendChild(button);
        });

        if (isTestFinished) {
            const questionButton = document.querySelector(`#question-buttons .question-btn:nth-child(${currentQuestionIndex + 1})`);
            questionButton.addEventListener("click", () => {
                const buttons = document.querySelectorAll(`#options button`);
                buttons.forEach(button => {
                    button.style.display = "block";
                });
            });
        }

        document.getElementById("finish-btn").style.display = currentQuestionIndex === questions.length - 1 ? "block" : "none";
        updateNavigationButtons();
    }


    function highlightAnswers() {
        questions.forEach((question, index) => {
            const optionsButtons = document.querySelectorAll(`#options button`);

            optionsButtons.forEach((button, optionIndex) => {
                button.classList.remove("correct", "incorrect");

                if (optionIndex === question.correct) {
                    button.classList.add("correct");
                } else if (optionIndex === userAnswers[index]) {
                    button.classList.add("incorrect");
                }
            });
        });
    }

    function highlightQuestions() {
        const buttons = document.querySelectorAll(".question-btn");

        buttons.forEach((button, index) => {
            button.classList.remove("correct", "incorrect", "active", "answered");

            if (userAnswers[index] === undefined) {
                return;
            }

            if (userAnswers[index] === questions[index].correct) {
                button.classList.add("correct");
            } else {
                button.classList.add("incorrect");
            }
        });
    }

    function selectAnswer(button, selectedIndex) {
        userAnswers[currentQuestionIndex] = selectedIndex;

        // Спочатку знімаємо "selected" з усіх кнопок, потім додаємо для обраної
        document.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        updateNavigationButtons();
    }

    function goToNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        }
    }

    function finishTest() {
        score = 0;
        userAnswers.forEach((answer, index) => {
            if (answer === questions[index].correct) {
                score++;
            }
        });

        saveResult();

        const lastResult = getLastResult()

        let resultText = `Ви відповіли правильно на ${score} з ${questions.length} питань!`;
        if (lastResult) {
            resultText += `<br>Ваша попередня спроба: ${lastResult.score} з ${questions.length} (Дата: ${lastResult.date})`;
        }

        document.getElementById("result").innerHTML = resultText
        document.getElementById("result").style.display = "block";

        highlightAnswers()
        highlightQuestions();

        document.getElementById("question-container").style.display = "none";
        document.getElementById("navigation").style.display = "none";

        isTestFinished = true;
        showQuestion();
    }

    function saveResult() {
        fetch('/check-auth', { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    console.log("Користувач залогінений:", data.email);
                    saveRegister(data.email); // Зберігаємо в файл
                } else {
                    console.log("Користувач НЕ залогінений");
                }
                saveLocal(); // Завжди зберігаємо в localStorage
            })
            .catch(error => console.error("Помилка перевірки авторизації:", error));
    }

    function saveRegister(email) {
        //TODO: Добавити перевірку на логі, а не шукати в усьому файлику клієнта
        const result = {
            email,
            date: new Date().toLocaleDateString(),
            score
        };

        fetch("/save-result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result)
        })
            .then(response => response.json())
            .then(data => console.log("Результат збережено:", data))
            .catch(error => console.error("Помилка збереження:", error));
    }

    function getLastResult() {
        const results = JSON.parse(localStorage.getItem("results")) || [];
        return results.length > 1 ? results[results.length - 1] : null; // Передостанній запис (бо останній – новий)
    }

    function saveLocal() {
        const results = JSON.parse(localStorage.getItem("results")) || [];
        results.push({date: new Date().toLocaleDateString(), score});
        localStorage.setItem("results", JSON.stringify(results));
    }

    document.getElementById("next-btn").addEventListener("click", goToNextQuestion);
    document.getElementById("finish-btn").addEventListener("click", finishTest);
});
