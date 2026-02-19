// Configuration
const CONFIG = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: {
        'image/jpeg': { ext: 'jpg', icon: 'fa-image', class: 'image' },
        'image/png': { ext: 'png', icon: 'fa-image', class: 'image' },
        'application/pdf': { ext: 'pdf', icon: 'fa-file-pdf', class: 'pdf' },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', icon: 'fa-file-word', class: 'doc' }
    }
};

// State
let selectedFiles = [];
let dragCounter = 0;

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileList = document.getElementById('fileList');
const actionButtons = document.getElementById('actionButtons');
const fileCounter = document.getElementById('fileCounter');
const fileCount = document.getElementById('fileCount');
const clearBtn = document.getElementById('clearBtn');
const uploadBtn = document.getElementById('uploadBtn');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});
fileInput.addEventListener('change', handleFileSelect);
clearBtn.addEventListener('click', clearAllFiles);
uploadBtn.addEventListener('click', uploadFiles);
themeToggle.addEventListener('click', toggleTheme);

// Drag and Drop Events
dropZone.addEventListener('dragenter', handleDragEnter);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);

// Drag Counter Fix
function handleDragEnter(e) {
    e.preventDefault();
    dragCounter++;
    dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
        dropZone.classList.remove('drag-over');
    }
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    dragCounter = 0;
    dropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

// File Selection
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
    fileInput.value = '';
}

// Process Files
function processFiles(files) {
    files.forEach(file => {
        if (validateFile(file)) {
            selectedFiles.push(file);
            addFileToList(file);
        }
    });
    updateUI();
}

// File Validation
function validateFile(file) {
    // Check file type
    if (!CONFIG.allowedTypes[file.type]) {
        showToast(`${file.name}: Invalid file type. Only JPG, PNG, PDF, DOCX allowed.`, 'error');
        return false;
    }
    
    // Check file size
    if (file.size > CONFIG.maxFileSize) {
        showToast(`${file.name}: File too large. Maximum size is 5MB.`, 'error');
        return false;
    }
    
    // Check duplicate
    if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        showToast(`${file.name}: File already added.`, 'error');
        return false;
    }
    
    return true;
}

// Add File to List
function addFileToList(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.fileName = file.name;
    
    const fileType = CONFIG.allowedTypes[file.type];
    const fileSize = formatFileSize(file.size);
    
    // Create file icon or preview
    let iconHTML;
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = fileItem.querySelector('.file-preview');
            if (img) img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        iconHTML = `<img src="" alt="preview" class="file-preview">`;
    } else {
        iconHTML = `<div class="file-icon ${fileType.class}">
            <i class="fas ${fileType.icon}"></i>
        </div>`;
    }
    
    fileItem.innerHTML = `
        ${iconHTML}
        <div class="file-details">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${fileSize}</div>
            <div class="progress-container" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text">
                    <span>Uploading...</span>
                    <span class="progress-percent">0%</span>
                </div>
            </div>
        </div>
        <button class="file-remove" onclick="removeFile('${file.name}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    fileList.appendChild(fileItem);
}

// Remove File
function removeFile(fileName) {
    selectedFiles = selectedFiles.filter(f => f.name !== fileName);
    const fileItem = document.querySelector(`[data-file-name="${fileName}"]`);
    if (fileItem) {
        fileItem.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => fileItem.remove(), 300);
    }
    updateUI();
}

// Clear All Files
function clearAllFiles() {
    selectedFiles = [];
    fileList.innerHTML = '';
    updateUI();
    showToast('All files cleared', 'success');
}

// Upload Files (Simulated)
function uploadFiles() {
    if (selectedFiles.length === 0) return;
    
    uploadBtn.disabled = true;
    clearBtn.disabled = true;
    
    selectedFiles.forEach((file, index) => {
        setTimeout(() => {
            simulateUpload(file);
        }, index * 500);
    });
}

// Simulate Upload Progress
function simulateUpload(file) {
    const fileItem = document.querySelector(`[data-file-name="${file.name}"]`);
    if (!fileItem) return;
    
    const progressContainer = fileItem.querySelector('.progress-container');
    const progressFill = fileItem.querySelector('.progress-fill');
    const progressPercent = fileItem.querySelector('.progress-percent');
    const removeBtn = fileItem.querySelector('.file-remove');
    
    progressContainer.style.display = 'block';
    removeBtn.disabled = true;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressPercent.textContent = Math.round(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressContainer.querySelector('.progress-text span:first-child').textContent = 'Completed';
                progressFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
                
                // Check if all uploads complete
                checkAllUploadsComplete();
            }, 300);
        }
    }, 200);
}

// Check All Uploads Complete
function checkAllUploadsComplete() {
    const allComplete = Array.from(fileList.querySelectorAll('.progress-text span:first-child'))
        .every(span => span.textContent === 'Completed');
    
    if (allComplete) {
        showToast(`Successfully uploaded ${selectedFiles.length} file(s)!`, 'success');
        uploadBtn.disabled = false;
        clearBtn.disabled = false;
        
        setTimeout(() => {
            clearAllFiles();
        }, 2000);
    }
}

// Update UI
function updateUI() {
    const hasFiles = selectedFiles.length > 0;
    
    actionButtons.style.display = hasFiles ? 'flex' : 'none';
    fileCounter.style.display = hasFiles ? 'flex' : 'none';
    fileCount.textContent = selectedFiles.length;
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Toast Notification
function showToast(message, type = 'success') {
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Theme Toggle
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Load Theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize
loadTheme();
