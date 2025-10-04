// Show section navigation
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => section.style.display = 'none');
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
}

// Sidebar toggle
const sidebarBtn = document.querySelector(".sidebarBtn");
const sidebar = document.querySelector(".sidebar");

sidebarBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});

// Profile dropdown toggle
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
window.addEventListener('click', function(e) {
    const profileDetails = document.querySelector('.profile-details');
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown && !profileDetails.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Start test function - Modified to show alert instead
function startTest(testName, questions, duration) {
    alert(`Starting ${testName} test!\n\nQuestions: ${questions}\nDuration: ${duration} minutes\n\nThis will redirect to a separate test page.`);
    // In production, you would redirect to test page:
    // window.location.href = `test.html?name=${encodeURIComponent(testName)}&questions=${questions}&duration=${duration}`;
}

// View detailed result - Modified to remove test logic
function viewDetailedResult(subject, score, status) {
    const modal = document.getElementById('resultModal');
    const content = document.getElementById('resultContent');
    
    const statusClass = status === 'Pass' ? 'status-pass' : 'status-fail';
    
    content.innerHTML = `
        <div class="result-summary">
            <h2>${subject}</h2>
            <div class="score-display">${score}/100</div>
            <span class="status-badge ${statusClass}" style="font-size: 16px; padding: 8px 16px;">${status}</span>
        </div>
        <div style="text-align: center; padding: 20px;">
            <p style="color: #666; margin-bottom: 20px;">Detailed report will be available on the test results page</p>
            <button class="btn btn-success" onclick="downloadResult('${subject}')">
                <i class="bx bx-download"></i> Download Report
            </button>
        </div>
    `;
    
    modal.classList.add('show');
}

// Download result function
function downloadResult(subject) {
    alert(`Downloading report for ${subject}...\n\nReport will be downloaded as PDF.`);
    // In production, trigger actual download:
    // window.location.href = `/api/download-report?subject=${encodeURIComponent(subject)}`;
}

// Download all results
function downloadAllResults() {
    alert('Downloading all test reports...\n\nReports will be downloaded as a ZIP file.');
    // In production, trigger actual download:
    // window.location.href = '/api/download-all-reports';
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});