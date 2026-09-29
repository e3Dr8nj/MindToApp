// Состояние
let timeLeft = 25 * 60; // 25 минут в секундах
let isRunning = false;
let intervalId = null;
let cycles = parseInt(localStorage.getItem('pomodoroCycles') || '0');
let currentMode = 'work';

// DOM элементы
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const cyclesDisplay = document.getElementById('cycles');
const modeButtons = document.querySelectorAll('.mode-btn');

// Инициализация
cyclesDisplay.textContent = cycles;
updateTimerDisplay();

// Форматирование времени
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Старт таймера
function startTimer() {
  if (isRunning) return;
  
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  
  intervalId = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      
      if (currentMode === 'work') {
        cycles++;
        localStorage.setItem('pomodoroCycles', cycles);
        cyclesDisplay.textContent = cycles;
        alert('🎉 Работа завершена! Время перерыва.');
      } else {
        alert('⏰ Перерыв окончен! Время работать.');
      }
      
      resetTimer();
    }
  }, 1000);
}

// Пауза таймера
function pauseTimer() {
  if (!isRunning) return;
  
  isRunning = false;
  clearInterval(intervalId);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

// Сброс таймера
function resetTimer() {
  pauseTimer();
  timeLeft = currentMode === 'work' ? 25 * 60 : 5 * 60;
  updateTimerDisplay();
}

// Переключение режима
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    resetTimer();
  });
});

// Обработчики событий
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);