// Application state
const appState = {
    currentTask: 0,
    totalTime: 60 * 60 * 1000, // 60 minutes in milliseconds
    startTime: null,
    taskStartTimes: {},
    taskCompletedTimes: {},
    taskScores: {},
    isRunning: false,
    timerInterval: null,
    taskTimerInterval: null,
    draggedCard: null
};

// Lab data
const labData = {
    osExamples: [
        {name: "Linux", architecture: "Монолитная", description: "Модульное монолитное ядро"},
        {name: "Windows NT", architecture: "Гибридная", description: "Микроядро с модулями в ядре"},
        {name: "QNX", architecture: "Микроядерная", description: "Чистая микроядерная архитектура"},
        {name: "macOS", architecture: "Гибридная", description: "Mach микроядро + BSD"},
        {name: "MINIX", architecture: "Микроядерная", description: "Академическая микроядерная ОС"}
    ],
    commands: [
        {cmd: "uname -a", description: "Информация о ядре", sample_output: "Linux ubuntu 5.15.0-75-generic #82-Ubuntu SMP Tue Jun 27 19:30:28 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux"},
        {cmd: "lsmod", description: "Загруженные модули", sample_output: "Module                  Size  Used by\nvideo                  49152  1 i915\ni915                 2883584  12\ndrm_kms_helper        307200  1 i915"},
        {cmd: "cat /proc/version", description: "Версия ядра", sample_output: "Linux version 5.15.0-75-generic (buildd@lcy02-amd64-043) (gcc (Ubuntu 9.4.0-1ubuntu1~20.04.1) 9.4.0, GNU ld (GNU Binutils for Ubuntu) 2.34) #82-Ubuntu SMP Tue Jun 27 19:30:28 UTC 2023"},
        {cmd: "ps aux | head -10", description: "Системные процессы", sample_output: "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1 169760 11784 ?        Ss   10:30   0:01 /sbin/init splash\nroot         2  0.0  0.0      0     0 ?        S    10:30   0:00 [kthreadd]"}
    ]
};

// Task completion tracking
const taskResults = {
    task1: { completed: false, score: 0, answers: {} },
    task2: { completed: false, score: 0, answers: {} },
    task3: { completed: false, score: 0, answers: {} },
    task4: { completed: false, score: 0, answers: {} }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing application...');
    setupTask1();
    setupTask2();
    updateTimerDisplay();
}

// Timer functions
function startTimer() {
    if (appState.isRunning) return;
    
    console.log('Starting timer...');
    appState.isRunning = true;
    appState.startTime = Date.now();
    
    appState.timerInterval = setInterval(updateTimer, 1000);
    updateTimerDisplay();
}

function updateTimer() {
    if (!appState.isRunning) return;
    
    const elapsed = Date.now() - appState.startTime;
    const remaining = Math.max(0, appState.totalTime - elapsed);
    
    if (remaining === 0) {
        finishLab();
        return;
    }
    
    updateTimerDisplay(remaining);
    updateProgressBar(elapsed / appState.totalTime);
}

function updateTimerDisplay(remaining = appState.totalTime) {
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = display;
    }
}

function updateProgressBar(progress) {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress * 100}%`;
    }
}

function startTaskTimer(taskNumber, duration) {
    const timerId = `task${taskNumber}-timer`;
    const timerElement = document.getElementById(timerId);
    
    if (!timerElement) return;
    
    let remaining = duration * 60 * 1000; // Convert minutes to milliseconds
    appState.taskStartTimes[taskNumber] = Date.now();
    
    function updateTaskTimer() {
        if (remaining <= 0) {
            timerElement.textContent = "0:00";
            return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        remaining -= 1000;
    }
    
    updateTaskTimer();
    if (appState.taskTimerInterval) {
        clearInterval(appState.taskTimerInterval);
    }
    appState.taskTimerInterval = setInterval(updateTaskTimer, 1000);
}

function stopTaskTimer(taskNumber) {
    if (appState.taskTimerInterval) {
        clearInterval(appState.taskTimerInterval);
        appState.taskTimerInterval = null;
    }
    
    if (appState.taskStartTimes[taskNumber]) {
        const elapsed = Date.now() - appState.taskStartTimes[taskNumber];
        appState.taskCompletedTimes[taskNumber] = elapsed;
    }
}

// Navigation functions
function startLab() {
    console.log('Starting lab...');
    startTimer();
    showScreen('task1');
    startTaskTimer(1, 15);
    appState.currentTask = 1;
}

function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function nextTask(taskNumber) {
    console.log('Moving to next task:', taskNumber);
    stopTaskTimer(appState.currentTask);
    appState.currentTask = taskNumber;
    showScreen(`task${taskNumber}`);
    
    const durations = { 1: 15, 2: 20, 3: 15, 4: 10 };
    startTaskTimer(taskNumber, durations[taskNumber]);
}

function prevTask(taskNumber) {
    console.log('Moving to previous task:', taskNumber);
    stopTaskTimer(appState.currentTask);
    appState.currentTask = taskNumber;
    showScreen(`task${taskNumber}`);
    
    const durations = { 1: 15, 2: 20, 3: 15, 4: 10 };
    startTaskTimer(taskNumber, durations[taskNumber]);
}

// Task 1: OS Classification Setup - Improved with multiple interaction methods
function setupTask1() {
    console.log('Setting up Task 1...');
    const osCardsContainer = document.getElementById('os-cards');
    if (!osCardsContainer) {
        console.error('OS cards container not found!');
        return;
    }
    
    // Clear existing cards
    osCardsContainer.innerHTML = '';
    
    labData.osExamples.forEach((os, index) => {
        const card = document.createElement('div');
        card.className = 'os-card';
        card.draggable = true;
        card.dataset.osName = os.name;
        card.dataset.architecture = os.architecture;
        card.id = `os-card-${index}`;
        card.innerHTML = `
            <h4>${os.name}</h4>
            <p>${os.description}</p>
        `;
        
        // Add multiple event listeners for better compatibility
        card.addEventListener('dragstart', handleDragStart, true);
        card.addEventListener('dragend', handleDragEnd, true);
        card.addEventListener('mousedown', handleMouseDown);
        
        // Add click-to-move as fallback
        card.addEventListener('click', handleCardClick);
        card.style.cursor = 'pointer';
        
        osCardsContainer.appendChild(card);
    });
    
    // Setup drop zones with improved event handling
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver, true);
        zone.addEventListener('drop', handleDrop, true);
        zone.addEventListener('dragenter', handleDragEnter, true);
        zone.addEventListener('dragleave', handleDragLeave, true);
        zone.addEventListener('click', handleZoneClick);
    });
    
    console.log('Task 1 setup complete. Cards created:', labData.osExamples.length);
}

// Enhanced drag and drop handlers
function handleMouseDown(e) {
    console.log('Mouse down on card:', e.target.dataset.osName);
}

function handleCardClick(e) {
    e.stopPropagation();
    const card = e.currentTarget;
    
    // Toggle selection
    if (appState.draggedCard === card) {
        // Deselect
        appState.draggedCard = null;
        card.style.border = '2px solid var(--color-border)';
        console.log('Card deselected:', card.dataset.osName);
    } else {
        // Clear previous selection
        if (appState.draggedCard) {
            appState.draggedCard.style.border = '2px solid var(--color-border)';
        }
        
        // Select new card
        appState.draggedCard = card;
        card.style.border = '3px solid var(--color-primary)';
        console.log('Card selected:', card.dataset.osName);
    }
}

function handleZoneClick(e) {
    e.stopPropagation();
    const zone = e.currentTarget;
    
    if (appState.draggedCard) {
        // Move selected card to zone
        try {
            zone.appendChild(appState.draggedCard);
            appState.draggedCard.style.border = '2px solid var(--color-border)';
            appState.draggedCard = null;
            console.log('Card moved via click to zone:', zone.id);
        } catch (error) {
            console.error('Error moving card via click:', error);
        }
    } else {
        console.log('No card selected for zone click');
    }
}

function handleDragStart(e) {
    console.log('Drag start:', e.target.dataset.osName);
    appState.draggedCard = e.target;
    e.target.classList.add('dragging');
    
    // Set drag data for better browser compatibility
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.osName);
        e.dataTransfer.setData('application/json', JSON.stringify({
            osName: e.target.dataset.osName,
            architecture: e.target.dataset.architecture
        }));
    }
}

function handleDragEnd(e) {
    console.log('Drag end');
    e.target.classList.remove('dragging');
    
    // Clean up any drag-over states
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
    return false;
}

function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.classList.contains('drop-zone')) {
        e.target.classList.add('drag-over');
        console.log('Drag enter zone:', e.target.id);
    }
}

function handleDragLeave(e) {
    e.stopPropagation();
    if (e.target.classList.contains('drop-zone')) {
        e.target.classList.remove('drag-over');
        console.log('Drag leave zone:', e.target.id);
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop event triggered');
    
    const dropZone = e.target.closest('.drop-zone');
    if (!dropZone) {
        console.log('Drop target is not a drop zone');
        return false;
    }
    
    dropZone.classList.remove('drag-over');
    
    // Get the dragged element
    let draggedElement = appState.draggedCard;
    
    // Fallback: try to find by data transfer
    if (!draggedElement && e.dataTransfer) {
        const osName = e.dataTransfer.getData('text/plain');
        if (osName) {
            draggedElement = document.querySelector(`[data-os-name="${osName}"]`);
        }
    }
    
    if (!draggedElement) {
        console.error('No dragged element found!');
        return false;
    }
    
    // Move the dragged element to the drop zone
    try {
        dropZone.appendChild(draggedElement);
        draggedElement.classList.remove('dragging');
        console.log('Successfully moved card to zone:', dropZone.id);
        return true;
    } catch (error) {
        console.error('Drop error:', error);
        return false;
    }
}

function resetTask1() {
    console.log('Resetting Task 1...');
    const osCardsContainer = document.getElementById('os-cards');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    if (!osCardsContainer) return;
    
    // Clear selection
    appState.draggedCard = null;
    
    // Clear drop zones and move cards back to source
    dropZones.forEach(zone => {
        zone.classList.remove('correct', 'incorrect', 'drag-over');
        const cards = zone.querySelectorAll('.os-card');
        cards.forEach(card => {
            card.style.border = '2px solid var(--color-border)';
            osCardsContainer.appendChild(card);
        });
    });
    
    const nextButton = document.getElementById('next1');
    if (nextButton) {
        nextButton.disabled = true;
    }
    
    removeFeedbackMessage();
    console.log('Task 1 reset complete');
}

function checkTask1() {
    console.log('Checking Task 1 answers...');
    const dropZones = document.querySelectorAll('.drop-zone');
    let correctCount = 0;
    let totalCount = 0;
    
    dropZones.forEach(zone => {
        const categoryColumn = zone.closest('.category-column');
        if (!categoryColumn) return;
        
        const expectedArchitecture = categoryColumn.dataset.architecture;
        const cards = zone.querySelectorAll('.os-card');
        
        let zoneCorrect = true;
        
        cards.forEach(card => {
            totalCount++;
            const actualArchitecture = card.dataset.architecture;
            
            console.log(`Card ${card.dataset.osName}: Expected ${expectedArchitecture}, Got ${actualArchitecture}`);
            
            if (actualArchitecture === expectedArchitecture) {
                correctCount++;
            } else {
                zoneCorrect = false;
            }
        });
        
        // Mark zone as correct or incorrect
        if (cards.length > 0) {
            if (zoneCorrect) {
                zone.classList.add('correct');
                zone.classList.remove('incorrect');
            } else {
                zone.classList.add('incorrect');
                zone.classList.remove('correct');
            }
        }
    });
    
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    taskResults.task1.score = score;
    taskResults.task1.completed = true;
    taskResults.task1.answers = { correct: correctCount, total: totalCount };
    
    console.log(`Task 1 result: ${correctCount}/${totalCount} correct (${score}%)`);
    
    showFeedbackMessage(
        score >= 80 ? 'success' : 'error',
        `Результат: ${correctCount}/${totalCount} правильных ответов (${score}%)`
    );
    
    const nextButton = document.getElementById('next1');
    if (nextButton) {
        if (score >= 60) {
            nextButton.disabled = false;
            console.log('Next button enabled');
        } else {
            console.log('Score too low, next button remains disabled');
        }
    } else {
        console.error('Next button not found!');
    }
}

// Task 2: Command Simulator Setup
function setupTask2() {
    console.log('Setting up Task 2...');
    const commandButtonsContainer = document.getElementById('command-buttons');
    if (!commandButtonsContainer) {
        console.log('Command buttons container not found, Task 2 not setup yet');
        return;
    }
    
    commandButtonsContainer.innerHTML = '';
    
    labData.commands.forEach((command, index) => {
        const button = document.createElement('div');
        button.className = 'command-btn';
        button.dataset.commandIndex = index;
        button.innerHTML = `
            <div class="cmd">${command.cmd}</div>
            <div class="description">${command.description}</div>
        `;
        
        button.addEventListener('click', () => executeCommand(index));
        commandButtonsContainer.appendChild(button);
    });
    
    console.log('Task 2 setup complete');
}

function executeCommand(index) {
    console.log('Executing command:', index);
    const command = labData.commands[index];
    const terminal = document.getElementById('terminal');
    const button = document.querySelector(`[data-command-index="${index}"]`);
    
    if (!terminal || !command) {
        console.error('Terminal or command not found');
        return;
    }
    
    // Remove existing cursor
    const existingCursor = terminal.querySelector('.cursor');
    if (existingCursor) {
        existingCursor.parentElement.remove();
    }
    
    // Add command to terminal
    const commandLine = document.createElement('div');
    commandLine.className = 'terminal-command';
    commandLine.textContent = `user@system:~$ ${command.cmd}`;
    
    const output = document.createElement('div');
    output.className = 'terminal-output';
    output.textContent = command.sample_output;
    
    terminal.appendChild(commandLine);
    terminal.appendChild(output);
    
    // Add new prompt line with cursor
    const newPrompt = document.createElement('div');
    newPrompt.className = 'terminal-prompt';
    newPrompt.innerHTML = 'user@system:~$ <span class="cursor">|</span>';
    terminal.appendChild(newPrompt);
    
    // Mark button as executed
    if (button) {
        button.classList.add('executed');
    }
    
    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
    console.log('Command executed successfully');
}

function checkTask2() {
    console.log('Checking Task 2...');
    const architecture = document.getElementById('architecture-analysis');
    const reasoning = document.getElementById('analysis-reasoning');
    
    if (!architecture || !reasoning) {
        console.error('Task 2 form elements not found');
        return;
    }
    
    const architectureValue = architecture.value;
    const reasoningValue = reasoning.value.trim();
    
    if (!architectureValue || !reasoningValue) {
        showFeedbackMessage('error', 'Пожалуйста, выберите архитектуру и предоставьте обоснование.');
        return;
    }
    
    let score = 0;
    
    // Check if the correct architecture is selected (Linux is monolithic)
    if (architectureValue === 'monolithic') {
        score += 50;
    }
    
    // Check reasoning quality (simple heuristic)
    if (reasoningValue.length > 50) {
        score += 50;
    }
    
    taskResults.task2.score = score;
    taskResults.task2.completed = true;
    taskResults.task2.answers = { architecture: architectureValue, reasoning: reasoningValue };
    
    console.log('Task 2 score:', score);
    
    showFeedbackMessage(
        score >= 80 ? 'success' : 'error',
        `Результат: ${score}% - ${score >= 80 ? 'Хорошо!' : 'Требует улучшения'}`
    );
    
    const nextButton = document.getElementById('next2');
    if (nextButton && score >= 60) {
        nextButton.disabled = false;
    }
}

function checkTask3() {
    console.log('Checking Task 3...');
    let score = 0;
    
    // Check monolithic advantages
    const monolithicAdvantages = document.querySelectorAll('#monolithic-advantages input:checked');
    const correctMonolithic = ['performance', 'direct-access'];
    
    let correctMonolithicCount = 0;
    monolithicAdvantages.forEach(checkbox => {
        if (correctMonolithic.includes(checkbox.value)) {
            correctMonolithicCount++;
        }
    });
    score += (correctMonolithicCount / correctMonolithic.length) * 20;
    
    // Check microkernel advantages
    const microkernelAdvantages = document.querySelectorAll('#microkernel-advantages input:checked');
    const correctMicrokernel = ['reliability', 'modularity'];
    
    let correctMicrokernelCount = 0;
    microkernelAdvantages.forEach(checkbox => {
        if (correctMicrokernel.includes(checkbox.value)) {
            correctMicrokernelCount++;
        }
    });
    score += (correctMicrokernelCount / correctMicrokernel.length) * 20;
    
    // Check scenario matching
    const scenarios = document.querySelectorAll('.scenario-item select');
    const correctScenarios = ['monolithic', 'microkernel', 'hybrid'];
    
    scenarios.forEach((select, index) => {
        if (select.value === correctScenarios[index]) {
            score += 20;
        }
    });
    
    score = Math.round(score);
    taskResults.task3.score = score;
    taskResults.task3.completed = true;
    taskResults.task3.answers = {
        monolithicAdvantages: Array.from(monolithicAdvantages).map(cb => cb.value),
        microkernelAdvantages: Array.from(microkernelAdvantages).map(cb => cb.value),
        scenarios: Array.from(scenarios).map(s => s.value)
    };
    
    console.log('Task 3 score:', score);
    
    showFeedbackMessage(
        score >= 80 ? 'success' : 'error',
        `Результат: ${score}% - ${score >= 80 ? 'Отлично!' : 'Требует улучшения'}`
    );
    
    const nextButton = document.getElementById('next3');
    if (nextButton && score >= 60) {
        nextButton.disabled = false;
    }
}

function finishLab() {
    console.log('Finishing lab...');
    stopTaskTimer(appState.currentTask);
    
    // Calculate final score for task 4
    const conclusions = {
        mainConclusions: document.getElementById('main-conclusions')?.value.trim() || '',
        applicability: document.getElementById('applicability')?.value.trim() || '',
        trends: document.getElementById('trends')?.value.trim() || '',
        tradeoffs: document.getElementById('tradeoffs')?.value.trim() || ''
    };
    
    let task4Score = 0;
    Object.values(conclusions).forEach(text => {
        if (text.length > 30) task4Score += 25;
    });
    
    taskResults.task4.score = task4Score;
    taskResults.task4.completed = true;
    taskResults.task4.answers = conclusions;
    
    // Stop main timer
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
    }
    
    appState.isRunning = false;
    showResults();
}

function showResults() {
    console.log('Showing results...');
    showScreen('results');
    
    // Populate results
    const resultsGrid = document.getElementById('results-grid');
    if (!resultsGrid) return;
    
    resultsGrid.innerHTML = '';
    
    const tasks = ['task1', 'task2', 'task3', 'task4'];
    const taskNames = ['Теоретическое введение', 'Исследование архитектуры', 'Моделирование', 'Презентация'];
    
    tasks.forEach((task, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <h4>${taskNames[index]}</h4>
            <div class="result-score">${taskResults[task].score}%</div>
        `;
        resultsGrid.appendChild(resultItem);
    });
    
    // Calculate total score
    const totalScore = Math.round(
        (taskResults.task1.score + taskResults.task2.score + taskResults.task3.score + taskResults.task4.score) / 4
    );
    
    const totalResultItem = document.createElement('div');
    totalResultItem.className = 'result-item';
    totalResultItem.style.background = 'var(--color-bg-3)';
    totalResultItem.innerHTML = `
        <h4>Общий результат</h4>
        <div class="result-score">${totalScore}%</div>
    `;
    resultsGrid.appendChild(totalResultItem);
    
    // Show time breakdown
    const timeBreakdown = document.getElementById('time-breakdown');
    if (!timeBreakdown) return;
    
    timeBreakdown.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskNumber = index + 1;
        const elapsed = appState.taskCompletedTimes[taskNumber] || 0;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timeItem = document.createElement('div');
        timeItem.className = 'time-item';
        timeItem.innerHTML = `
            <div class="task-name">${taskNames[index]}</div>
            <div class="time-spent">${minutes}:${seconds.toString().padStart(2, '0')}</div>
        `;
        timeBreakdown.appendChild(timeItem);
    });
}

function generateReport() {
    console.log('Generating report...');
    const tasks = ['task1', 'task2', 'task3', 'task4'];
    const taskNames = ['Теоретическое введение', 'Исследование архитектуры', 'Моделирование', 'Презентация'];
    
    let report = 'Отчет по практической работе: Архитектурные подходы ОС\n';
    report += '='.repeat(60) + '\n\n';
    
    tasks.forEach((task, index) => {
        const taskNumber = index + 1;
        const elapsed = appState.taskCompletedTimes[taskNumber] || 0;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        report += `${taskNames[index]}: ${taskResults[task].score}% (${minutes}:${seconds.toString().padStart(2, '0')})\n`;
    });
    
    const totalScore = Math.round(
        (taskResults.task1.score + taskResults.task2.score + taskResults.task3.score + taskResults.task4.score) / 4
    );
    
    report += `\nОбщий результат: ${totalScore}%\n\n`;
    
    // Add detailed answers
    report += 'Детальные ответы:\n';
    report += '-'.repeat(20) + '\n\n';
    
    if (taskResults.task4.answers.mainConclusions) {
        report += 'Основные выводы:\n' + taskResults.task4.answers.mainConclusions + '\n\n';
    }
    
    if (taskResults.task4.answers.applicability) {
        report += 'Применимость архитектур:\n' + taskResults.task4.answers.applicability + '\n\n';
    }
    
    // Create downloadable file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'os_architecture_lab_report.txt';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function restartLab() {
    console.log('Restarting lab...');
    // Reset application state
    appState.currentTask = 0;
    appState.startTime = null;
    appState.taskStartTimes = {};
    appState.taskCompletedTimes = {};
    appState.isRunning = false;
    appState.draggedCard = null;
    
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
    }
    if (appState.taskTimerInterval) {
        clearInterval(appState.taskTimerInterval);
    }
    
    // Reset task results
    Object.keys(taskResults).forEach(task => {
        taskResults[task] = { completed: false, score: 0, answers: {} };
    });
    
    // Reset UI
    updateTimerDisplay();
    updateProgressBar(0);
    resetTask1();
    
    // Clear forms
    document.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Disable next buttons
    document.querySelectorAll('[id^="next"]').forEach(btn => {
        btn.disabled = true;
    });
    
    // Clear terminal
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.innerHTML = '<div class="terminal-prompt">user@system:~$ <span class="cursor">|</span></div>';
    }
    
    // Reset command buttons
    document.querySelectorAll('.command-btn').forEach(btn => {
        btn.classList.remove('executed');
    });
    
    // Show welcome screen
    showScreen('welcome');
}

// Utility functions
function showFeedbackMessage(type, message) {
    console.log('Showing feedback:', type, message);
    removeFeedbackMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `feedback-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.id = 'feedback-message';
    
    const taskActions = document.querySelector('.task-actions');
    if (taskActions && taskActions.parentNode) {
        taskActions.parentNode.insertBefore(messageDiv, taskActions);
    }
}

function removeFeedbackMessage() {
    const existingMessage = document.getElementById('feedback-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}