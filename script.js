(function () {
    const page = document.body.dataset.page;
    const container = document.querySelector(".container");
    const media = document.getElementById("media");
    const mediaPlaceholder = document.getElementById("media-placeholder");
    const pageScreenshotImage = document.querySelector(".page-screenshot-image");
    const questionText = document.getElementById("question-text");
    const answerButtons = document.getElementById("answer-buttons");
    const endingText = document.getElementById("ending-text");
    let content;
    let currentQuestion = 1;
    let noPressCount = 0;
    let backgroundRequestVersion = 0;

    media.addEventListener("load", function () {
        if (document.body.classList.contains("has-page-screenshot")) {
            media.hidden = true;
            mediaPlaceholder.hidden = true;
            return;
        }

        media.hidden = false;
        mediaPlaceholder.hidden = true;
    });

    media.addEventListener("error", function () {
        if (document.body.classList.contains("has-page-screenshot")) {
            media.hidden = true;
            media.removeAttribute("src");
            mediaPlaceholder.hidden = true;
            return;
        }

        media.hidden = true;
        media.removeAttribute("src");
        mediaPlaceholder.hidden = false;
    });

    function showMediaPlaceholder(placeholderText, altText) {
        media.hidden = true;
        media.removeAttribute("src");
        media.alt = altText;
        mediaPlaceholder.textContent = placeholderText;
        mediaPlaceholder.setAttribute("aria-label", altText + " placeholder");
        mediaPlaceholder.hidden = false;
    }

    function renderMedia(source, unresolvedSource, placeholderText, altText) {
        showMediaPlaceholder(placeholderText, altText);

        if (typeof source === "string" && source.trim() && source !== unresolvedSource) {
            media.src = source;
        }
    }

    function removePageScreenshotState() {
        document.body.classList.remove("has-page-screenshot", "has-page-screenshot-placeholder");
        pageScreenshotImage.style.removeProperty("--page-screenshot-image");
        pageScreenshotImage.removeAttribute("data-placeholder");
    }

    function showPageScreenshotPlaceholder(placeholderText) {
        media.hidden = true;
        media.removeAttribute("src");
        media.removeAttribute("alt");
        mediaPlaceholder.hidden = true;
        mediaPlaceholder.textContent = "";
        mediaPlaceholder.removeAttribute("aria-label");
        pageScreenshotImage.style.removeProperty("--page-screenshot-image");
        pageScreenshotImage.dataset.placeholder = placeholderText;
        document.body.classList.add("has-page-screenshot", "has-page-screenshot-placeholder");
    }

    function getScreenshotPlaceholder(imageKey) {
        const placeholder = content.screenshotPlaceholders
            && content.screenshotPlaceholders[imageKey];

        return typeof placeholder === "string" && placeholder.trim()
            ? placeholder
            : "";
    }

    function clearPageScreenshot() {
        backgroundRequestVersion += 1;
        removePageScreenshotState();
    }

    function getQuotedCssUrl(source) {
        const escapedSource = source.replace(/[\u0000-\u001f\u007f"\\]/g, function (character) {
            return "\\" + character.charCodeAt(0).toString(16) + " ";
        });

        return 'url("' + escapedSource + '")';
    }

    function renderAnswerBackground(button, imageKey, questionNumber) {
        const source = content.images[imageKey];
        const unresolvedSource = "path" + imageKey;

        if (typeof source !== "string" || !source.trim() || source === unresolvedSource) {
            return;
        }

        const requestVersion = backgroundRequestVersion;
        const backgroundImage = new Image();

        function isCurrentAnswer() {
            return requestVersion === backgroundRequestVersion
                && currentQuestion === questionNumber
                && answerButtons.contains(button);
        }

        backgroundImage.addEventListener("load", function () {
            if (!isCurrentAnswer()) {
                return;
            }

            button.style.setProperty("--answer-background-image", getQuotedCssUrl(source));
            button.classList.add("has-answer-background");
        });
        backgroundImage.addEventListener("error", function () {
            if (!isCurrentAnswer()) {
                return;
            }

            button.classList.remove("has-answer-background");
            button.style.removeProperty("--answer-background-image");
        });
        backgroundImage.src = source;
    }

    function createAnswerButton(label, imageKey, className, questionNumber) {
        const numericImageKey = String(imageKey);
        const button = document.createElement("button");
        const backgroundPlaceholder = document.createElement("span");
        const buttonLabel = document.createElement("span");

        button.type = "button";
        button.className = className;
        backgroundPlaceholder.className = "button-background-placeholder";
        backgroundPlaceholder.setAttribute("aria-hidden", "true");
        backgroundPlaceholder.textContent = numericImageKey;
        buttonLabel.className = "button-label";
        buttonLabel.textContent = label;
        button.append(backgroundPlaceholder, buttonLabel);
        answerButtons.append(button);
        renderAnswerBackground(button, numericImageKey, questionNumber);

        return button;
    }

    function renderPageScreenshot(
        source,
        unresolvedSource,
        placeholderText,
        isCurrentContext
    ) {
        showPageScreenshotPlaceholder(placeholderText);

        if (typeof source !== "string" || !source.trim() || source === unresolvedSource) {
            return;
        }

        const requestVersion = backgroundRequestVersion;
        const backgroundImage = new Image();

        backgroundImage.addEventListener("load", function () {
            if (requestVersion !== backgroundRequestVersion || !isCurrentContext()) {
                return;
            }

            pageScreenshotImage.style.setProperty("--page-screenshot-image", getQuotedCssUrl(source));
            document.body.classList.remove("has-page-screenshot-placeholder");
            pageScreenshotImage.removeAttribute("data-placeholder");
        });
        backgroundImage.addEventListener("error", function () {
            if (requestVersion !== backgroundRequestVersion || !isCurrentContext()) {
                return;
            }

            showPageScreenshotPlaceholder(placeholderText);
        });
        backgroundImage.src = source;
    }

    function getAnswers(question) {
        if (Array.isArray(question.answers)) {
            return question.answers;
        }

        return Object.values(question.answers || {});
    }

    function handleShrinkNo(answer, button) {
        const yesButton = answerButtons.querySelector(".yes-button");
        noPressCount += 1;

        if (noPressCount === 1) {
            button.querySelector(".button-label").textContent = answer.pressedLabel;
        }

        const yesScale = Math.pow(1.05, noPressCount);
        const noScale = Math.pow(0.95, noPressCount);
        yesButton.style.setProperty("--button-scale", String(yesScale));
        button.style.setProperty("--button-scale", String(noScale));
        button.focus();
    }

    function navigateToCelebration() {
        window.location.href = "yes_page.html";
    }

    function showSwitchSeatsEnding() {
        const ending = content.endings.switchSeats;

        questionText.textContent = ending.text;
        answerButtons.replaceChildren();
        answerButtons.hidden = false;
        answerButtons.classList.remove("is-scaling-question");
        noPressCount = 0;
        const continueButton = createAnswerButton(
            ending.continueLabel,
            ending.image,
            "yes-button continue-button",
            currentQuestion
        );
        continueButton.addEventListener("click", navigateToCelebration);
        document.title = content.pageTitles.switchSeats;
        continueButton.focus();
    }

    function handleAnswer(answer, button) {
        if (answer.action === "next") {
            renderQuestion(currentQuestion + 1, true);
        } else if (answer.action === "shrink-no") {
            handleShrinkNo(answer, button);
        } else if (answer.action === "celebrate") {
            navigateToCelebration();
        } else if (answer.action === "switch-seats") {
            showSwitchSeatsEnding();
        }
    }

    function renderQuestion(questionNumber, focusFirstAnswer) {
        clearPageScreenshot();

        const question = content.questions[String(questionNumber)];
        const imageKey = String(question.imageKey === undefined ? question.image : question.imageKey);
        const imageSource = content.images[imageKey];
        const imageAlt = "Illustration for Valentine question " + questionNumber;
        const answers = getAnswers(question);

        currentQuestion = questionNumber;
        noPressCount = 0;
        questionText.textContent = question.text;
        answerButtons.replaceChildren();
        answerButtons.hidden = false;
        answerButtons.classList.toggle(
            "is-scaling-question",
            answers.some(function (answer) {
                return answer.action === "shrink-no";
            })
        );

        answers.forEach(function (answer, index) {
            const button = createAnswerButton(
                answer.label,
                answer.image,
                index === 0 ? "yes-button" : "no-button",
                questionNumber
            );
            button.addEventListener("click", function () {
                handleAnswer(answer, button);
            });
        });

        if (imageKey === "1" || imageKey === "2" || imageKey === "3" || imageKey === "4") {
            renderPageScreenshot(
                imageSource,
                "path" + imageKey,
                getScreenshotPlaceholder(imageKey),
                function () {
                    return currentQuestion === questionNumber;
                }
            );
        } else {
            renderMedia(imageSource, "path" + imageKey, imageKey, imageAlt);
        }
        document.title = content.pageTitles.question.replace("{number}", String(questionNumber));
        container.setAttribute("aria-busy", "false");

        if (focusFirstAnswer) {
            answerButtons.querySelector("button").focus();
        }
    }

    function renderCelebration() {
        clearPageScreenshot();
        if (answerButtons) {
            answerButtons.classList.remove("is-scaling-question");
        }
        endingText.textContent = content.endings.celebration.text;
        renderPageScreenshot(
            content.celebrationScreenshot,
            "pathCelebration",
            getScreenshotPlaceholder("celebration"),
            function () {
                return page === "celebration";
            }
        );
        document.title = content.pageTitles.celebration;
        container.setAttribute("aria-busy", "false");
    }

    function showLoadError() {
        const message = "Unable to load Valentine content. Please try again later.";

        clearPageScreenshot();

        if (questionText) {
            questionText.textContent = message;
            answerButtons.replaceChildren();
            answerButtons.hidden = true;
            answerButtons.classList.remove("is-scaling-question");
        }

        if (endingText) {
            endingText.textContent = message;
        }

        media.hidden = true;
        media.removeAttribute("src");
        mediaPlaceholder.textContent = "Content unavailable";
        mediaPlaceholder.setAttribute("aria-label", "Content unavailable");
        mediaPlaceholder.hidden = false;
        document.title = content ? content.pageTitles.loadError : "Error";
        container.setAttribute("aria-busy", "false");
    }

    fetch("content.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Content request failed");
            }

            return response.json();
        })
        .then(function (data) {
            content = data;
            if (typeof content.titleOpacity === "number"
                && Number.isFinite(content.titleOpacity)
                && content.titleOpacity >= 0
                && content.titleOpacity <= 1) {
                document.documentElement.style.setProperty(
                    "--title-opacity",
                    String(content.titleOpacity)
                );
            }
            document.title = page === "celebration"
                ? content.pageTitles.celebration
                : content.pageTitles.quiz;

            if (page === "celebration") {
                renderCelebration();
            } else {
                renderQuestion(1);
            }
        })
        .catch(showLoadError);
}());
