const testConfig = {
    totalQuestions: 30,
    duration: 30 * 60,
    tabSwitchLimit: 3
};

let testState = {
    currentQuestion: 0,
    answers: {},
    tabSwitches: 0,
    timeRemaining: testConfig.duration,
    timerInterval: null,
    startTime: null,
    isTestActive: false,
    fullscreenExited: false
};

const questions = Array.from({length: 30}, (_, i) => ({
    id: i + 1,
    question: `What is the output of the following Java code snippet? (Question ${i + 1})`,
    options: [
        'Option A: Compilation Error',
        'Option B: Runtime Exception',
        'Option C: Prints "Hello World"',
        'Option D: No output'
    ],
    correctAnswer: Math.floor(Math.random() * 4)
}));

function startTest() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('testScreen').style.display = 'block';
    testState.isTestActive = true;
    enterFullscreen();
    initializeTest();
    startTimer();
    setupTabSwitchDetection();
    setupFullscreenDetection();
}

function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function setupFullscreenDetection() {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
}

function handleFullscreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && testState.isTestActive && !testState.fullscreenExited) {
        testState.fullscreenExited = true;
        testState.tabSwitches++;
        showWarningBanner();
        
        if (testState.tabSwitches >= testConfig.tabSwitchLimit) {
            autoSubmitTest('Fullscreen exit limit exceeded');
        }
    }
}

function initializeTest() {
    testState.startTime = Date.now();
    renderQuestionNavigator();
    renderQuestion();
}

function renderQuestionNavigator() {
    const nav = document.getElementById('questionNav');
    nav.innerHTML = questions.map((_, i) => {
        let classes = 'question-nav-btn';
        if (testState.answers[i + 1] !== undefined) {
            classes += ' answered';
        }
        if (i === testState.currentQuestion) {
            classes += ' current';
        }
        return `<button class="${classes}" onclick="goToQuestion(${i})">${i + 1}</button>`;
    }).join('');
}

function renderQuestion() {
    const q = questions[testState.currentQuestion];
    const container = document.getElementById('questionContainer');
    
    container.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <span class="question-number">Question ${q.id} of ${testConfig.totalQuestions}</span>
                <span class="question-marks">1 Mark</span>
            </div>
            <div class="question-text">${q.question}</div>
            <div class="options">
                ${q.options.map((opt, i) => `
                    <label class="option ${testState.answers[q.id] === i ? 'selected' : ''}">
                        <input type="radio" name="question${q.id}" value="${i}" 
                               ${testState.answers[q.id] === i ? 'checked' : ''}
                               onchange="saveAnswer(${q.id}, ${i})">
                        <span class="option-text">${opt}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;

    updateNavigationButtons();
}

function saveAnswer(questionId, optionIndex) {
    testState.answers[questionId] = optionIndex;
    
    const labels = document.querySelectorAll('.option');
    labels.forEach(label => label.classList.remove('selected'));
    event.target.closest('.option').classList.add('selected');
    
    renderQuestionNavigator();
}

function updateQuestionNavigator() {
    renderQuestionNavigator();
}

function goToQuestion(index) {
    testState.currentQuestion = index;
    renderQuestion();
    renderQuestionNavigator();
    window.scrollTo(0, 0);
}

function previousQuestion() {
    if (testState.currentQuestion > 0) {
        testState.currentQuestion--;
        renderQuestion();
        renderQuestionNavigator();
        window.scrollTo(0, 0);
    }
}

function nextQuestion() {
    if (testState.currentQuestion < questions.length - 1) {
        testState.currentQuestion++;
        renderQuestion();
        renderQuestionNavigator();
        window.scrollTo(0, 0);
    }
}

function updateNavigationButtons() {
    document.getElementById('prevBtn').style.display = 
        testState.currentQuestion === 0 ? 'none' : 'inline-flex';
    
    if (testState.currentQuestion === questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline-flex';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('submitBtn').style.display = 'none';
    }
}

function startTimer() {
    updateTimerDisplay();
    testState.timerInterval = setInterval(() => {
        testState.timeRemaining--;
        updateTimerDisplay();
        
        if (testState.timeRemaining <= 0) {
            clearInterval(testState.timerInterval);
            autoSubmitTest('Time expired');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(testState.timeRemaining / 60);
    const seconds = testState.timeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timerValue').textContent = display;
    
    if (testState.timeRemaining <= 300) {
        document.getElementById('timerValue').classList.add('warning');
    }
}

function showWarningBanner() {
    const banner = document.getElementById('warningBanner');
    document.getElementById('attemptsLeft').textContent = 
        testConfig.tabSwitchLimit - testState.tabSwitches;
    banner.classList.add('show');
    
    setTimeout(() => {
        banner.classList.remove('show');
    }, 5000);
}

function setupTabSwitchDetection() {
    let tabSwitchHandler = function() {
        if (document.hidden && testState.isTestActive) {
            testState.tabSwitches++;
            showWarningBanner();
            
            if (testState.tabSwitches >= testConfig.tabSwitchLimit) {
                document.removeEventListener('visibilitychange', tabSwitchHandler);
                autoSubmitTest('Tab switch limit exceeded');
            }
        }
    };

    document.addEventListener('visibilitychange', tabSwitchHandler);
}

function submitTest() {
    const unanswered = questions.length - Object.keys(testState.answers).length;
    if (unanswered > 0) {
        if (!confirm(`You have ${unanswered} unanswered questions. Do you want to submit?`)) {
            return;
        }
    }
    
    if (confirm('Are you sure you want to submit the test? This action cannot be undone.')) {
        finishTest();
    }
}

function autoSubmitTest(reason) {
    if (!testState.isTestActive) return;
    
    testState.isTestActive = false;
    alert(`Test auto-submitted: ${reason}`);
    finishTest();
}

function finishTest() {
    testState.isTestActive = false;
    clearInterval(testState.timerInterval);
    exitFullscreen();
    const results = calculateResults();
    showResults(results);
}

function calculateResults() {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const reviewData = [];

    questions.forEach(q => {
        const userAnswer = testState.answers[q.id];
        if (userAnswer === undefined) {
            unanswered++;
            reviewData.push({
                questionNum: q.id,
                question: q.question,
                status: 'unanswered',
                userAnswer: 'Not answered',
                correctAnswer: q.options[q.correctAnswer]
            });
        } else if (userAnswer === q.correctAnswer) {
            correct++;
            reviewData.push({
                questionNum: q.id,
                question: q.question,
                status: 'correct',
                userAnswer: q.options[userAnswer],
                correctAnswer: q.options[q.correctAnswer]
            });
        } else {
            wrong++;
            reviewData.push({
                questionNum: q.id,
                question: q.question,
                status: 'incorrect',
                userAnswer: q.options[userAnswer],
                correctAnswer: q.options[q.correctAnswer]
            });
        }
    });

    const score = Math.round((correct / questions.length) * 100);
    const timeSpent = testConfig.duration - testState.timeRemaining;
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;

    return {
        score,
        correct,
        wrong,
        unanswered,
        totalMarks: questions.length,
        marksObtained: correct,
        timeTaken: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        passed: score >= 60,
        reviewData
    };
}

function showResults(results) {
    document.getElementById('testScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';
    window.scrollTo(0, 0);
    
    document.getElementById('scoreValue').textContent = results.score;
    document.getElementById('marksObtained').textContent = results.marksObtained;
    document.getElementById('totalMarks').textContent = results.totalMarks;
    document.getElementById('correctCount').textContent = results.correct;
    document.getElementById('wrongCount').textContent = results.wrong;
    document.getElementById('unansweredCount').textContent = results.unanswered;
    document.getElementById('timeTaken').textContent = results.timeTaken;
    
    const verdict = document.getElementById('verdict');
    verdict.textContent = results.passed ? '✓ PASSED' : '✗ FAILED';
    verdict.className = `result-verdict ${results.passed ? 'pass' : 'fail'}`;
    
    renderAnswerReview(results.reviewData);
}

let currentFilter = 'all';
let allReviewData = [];

function renderAnswerReview(reviewData) {
    allReviewData = reviewData;
    const container = document.getElementById('answerReview');
    
    const filteredData = currentFilter === 'all' 
        ? reviewData 
        : reviewData.filter(item => item.status === currentFilter);
    
    if (filteredData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 40px;">No questions found in this category.</p>';
        return;
    }
    
    container.innerHTML = filteredData.map((item) => `
        <div class="answer-review ${item.status}" onclick="toggleReview(this)">
            <div class="review-header-row">
                <span class="review-question">
                    Question ${item.questionNum}
                    <i class='bx bx-chevron-down expand-icon'></i>
                </span>
                <span class="review-result ${item.status}">
                    ${item.status === 'correct' ? '✓ Correct' : 
                      item.status === 'incorrect' ? '✗ Incorrect' : '○ Unanswered'}
                </span>
            </div>
            <div class="review-content">
                <p><strong>Question:</strong> ${item.question}</p>
                <p><strong>Your Answer:</strong> ${item.userAnswer}</p>
                ${item.status !== 'correct' ? 
                  `<p><strong>Correct Answer:</strong> ${item.correctAnswer}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function toggleReview(element) {
    element.classList.toggle('expanded');
}

function filterReview(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderAnswerReview(allReviewData);
}

function downloadPDF() {
    alert('PDF Report is being generated and will download shortly.\n\nReport includes:\n• Score Summary\n• Question-wise Analysis\n• Time Taken\n• Performance Metrics\n• Institute Certificate');
}

function emailReport() {
    const email = prompt('Enter your email address to receive the test report:');
    if (email && email.includes('@')) {
        alert(`Test report will be sent to ${email}\n\nYou will receive:\n• Detailed Score Report\n• Answer Analysis\n• Performance Certificate (if passed)`);
    } else if (email) {
        alert('Please enter a valid email address.');
    }
}

function backToDashboard() {
    if (confirm('Are you sure you want to return to dashboard?')) {
        window.location.href = 'student-dashboard.html';
    }
}

document.addEventListener('contextmenu', function(e) {
    if (testState.isTestActive) {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('keydown', function(e) {
    if (testState.isTestActive) {
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
    }
});

window.addEventListener('beforeunload', function(e) {
    if (testState.isTestActive) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});