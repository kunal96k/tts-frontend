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
        elem.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log('Exit fullscreen error:', err));
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function setupFullscreenDetection() {
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && testState.isTestActive && !testState.fullscreenExited) {
            testState.fullscreenExited = true;
            testState.tabSwitches++;
            showWarningBanner();
            
            if (testState.tabSwitches >= testConfig.tabSwitchLimit) {
                autoSubmitTest('Fullscreen exit limit exceeded');
            }
        }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
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
    const tabSwitchHandler = function() {
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
                options: q.options,
                status: 'unanswered',
                userAnswer: 'Not answered',
                userAnswerIndex: null,
                correctAnswer: q.options[q.correctAnswer],
                correctAnswerIndex: q.correctAnswer
            });
        } else if (userAnswer === q.correctAnswer) {
            correct++;
            reviewData.push({
                questionNum: q.id,
                question: q.question,
                options: q.options,
                status: 'correct',
                userAnswer: q.options[userAnswer],
                userAnswerIndex: userAnswer,
                correctAnswer: q.options[q.correctAnswer],
                correctAnswerIndex: q.correctAnswer
            });
        } else {
            wrong++;
            reviewData.push({
                questionNum: q.id,
                question: q.question,
                options: q.options,
                status: 'incorrect',
                userAnswer: q.options[userAnswer],
                userAnswerIndex: userAnswer,
                correctAnswer: q.options[q.correctAnswer],
                correctAnswerIndex: q.correctAnswer
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

function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'F';
}

function showResults(results) {
    document.getElementById('testScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';
    window.scrollTo(0, 0);
    
    // Set test date and ID
    const now = new Date();
    document.getElementById('testDate').textContent = now.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
    });
    document.getElementById('assessmentId').textContent = 'TTS-' + now.getTime().toString().slice(-8);
    
    // Animate score circle
    const scoreCircle = document.getElementById('scoreCircle');
    const circumference = 565.48;
    const offset = circumference - (results.score / 100) * circumference;
    setTimeout(() => {
        scoreCircle.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        scoreCircle.style.strokeDashoffset = offset;
    }, 100);
    
    document.getElementById('scoreValue').textContent = results.score;
    document.getElementById('marksObtained').textContent = results.marksObtained;
    document.getElementById('totalMarks').textContent = results.totalMarks;
    document.getElementById('correctCount').textContent = results.correct;
    document.getElementById('wrongCount').textContent = results.wrong;
    document.getElementById('unansweredCount').textContent = results.unanswered;
    document.getElementById('timeTaken').textContent = results.timeTaken;
    
    // Set grade
    document.getElementById('gradeBadge').textContent = getGrade(results.score);
    
    const verdict = document.getElementById('verdict');
    if (results.passed) {
        verdict.innerHTML = '<i class="bx bx-check-circle"></i> PASSED';
        verdict.className = 'result-verdict pass';
    } else {
        verdict.innerHTML = '<i class="bx bx-x-circle"></i> FAILED';
        verdict.className = 'result-verdict fail';
    }
    
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
    if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
        alert('PDF library is loading. Please try again in a moment.');
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('TechnoKraft', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Training & Solution Pvt. Ltd.', pageWidth / 2, 28, { align: 'center' });
    doc.text('Test Performance Report', pageWidth / 2, 35, { align: 'center' });

    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // Test Information
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Test Information', 14, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const testDate = document.getElementById('testDate').textContent;
    const assessmentId = document.getElementById('assessmentId').textContent;
    
    doc.text(`Test Date: ${testDate}`, 14, yPos);
    yPos += 7;
    doc.text(`Assessment ID: ${assessmentId}`, 14, yPos);
    yPos += 7;
    doc.text('Assessment: Java Programming Final Test', 14, yPos);
    yPos += 15;

    // Performance Summary
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Performance Summary', 14, yPos);
    yPos += 10;

    const score = document.getElementById('scoreValue').textContent;
    const marksObtained = document.getElementById('marksObtained').textContent;
    const totalMarks = document.getElementById('totalMarks').textContent;
    const correct = document.getElementById('correctCount').textContent;
    const wrong = document.getElementById('wrongCount').textContent;
    const unanswered = document.getElementById('unansweredCount').textContent;
    const timeTaken = document.getElementById('timeTaken').textContent;
    const grade = document.getElementById('gradeBadge').textContent;
    const verdict = document.getElementById('verdict').textContent.trim();

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    doc.text(`Score: ${score}%`, 14, yPos);
    yPos += 7;
    doc.text(`Marks: ${marksObtained} / ${totalMarks}`, 14, yPos);
    yPos += 7;
    doc.text(`Grade: ${grade}`, 14, yPos);
    yPos += 7;
    doc.text(`Status: ${verdict}`, 14, yPos);
    yPos += 7;
    doc.text(`Correct Answers: ${correct}`, 14, yPos);
    yPos += 7;
    doc.text(`Wrong Answers: ${wrong}`, 14, yPos);
    yPos += 7;
    doc.text(`Unanswered: ${unanswered}`, 14, yPos);
    yPos += 7;
    doc.text(`Time Taken: ${timeTaken}`, 14, yPos);
    yPos += 15;

    // Detailed Analysis
    if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Detailed Question Analysis', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    allReviewData.forEach((item, index) => {
        if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 20;
        }

        // Question header with status
        doc.setFont(undefined, 'bold');
        const statusText = item.status === 'correct' ? '✓ Correct' : 
                         item.status === 'incorrect' ? '✗ Incorrect' : '○ Unanswered';
        
        if (item.status === 'correct') {
            doc.setTextColor(16, 185, 129);
        } else if (item.status === 'incorrect') {
            doc.setTextColor(239, 68, 68);
        } else {
            doc.setTextColor(245, 158, 11);
        }
        
        doc.text(`Q${item.questionNum}: ${statusText}`, 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 6;

        // Question text
        doc.setFont(undefined, 'normal');
        const questionLines = doc.splitTextToSize(item.question, pageWidth - 28);
        doc.text(questionLines, 14, yPos);
        yPos += questionLines.length * 5 + 3;

        // Your answer
        doc.setFont(undefined, 'bold');
        doc.text('Your Answer:', 14, yPos);
        yPos += 5;
        
        doc.setFont(undefined, 'normal');
        const answerLines = doc.splitTextToSize(item.userAnswer, pageWidth - 28);
        doc.text(answerLines, 14, yPos);
        yPos += answerLines.length * 5 + 3;

        // Correct answer (if wrong or unanswered)
        if (item.status !== 'correct') {
            doc.setFont(undefined, 'bold');
            doc.text('Correct Answer:', 14, yPos);
            yPos += 5;
            
            doc.setFont(undefined, 'normal');
            const correctLines = doc.splitTextToSize(item.correctAnswer, pageWidth - 28);
            doc.text(correctLines, 14, yPos);
            yPos += correctLines.length * 5 + 3;
        }

        yPos += 5;
    });

    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by TechnoKraft Online Assessment Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    const fileName = `Test_Report_${assessmentId}.pdf`;
    doc.save(fileName);
    
    alert('PDF Report downloaded successfully!');
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
        location.reload();
    }
}

// Security measures
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