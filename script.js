class PomodoroTimer {
    constructor() {
        this.canvas = document.getElementById('appleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.message = document.getElementById('message');
        this.startButton = document.getElementById('startButton');
        this.resumeButton = document.getElementById('resumeButton');
        this.resetButton = document.getElementById('resetButton');
        this.pomodoroCount = document.getElementById('pomodoroCount');

        this.currentPomodoro = 0;
        this.isRunning = false;
        this.currentInterval = null;
        this.isBreak = false;
        this.totalSeconds = 0;

        // 音
        this.workSound = new Audio('bell.mp3');
        this.breakSound = new Audio('break.mp3');

        this.WORK_MINUTES = 50;
        this.BREAK_MINUTES = 10;

        // 画像読み込み
        this.appleImage = new Image();
        this.appleImage.src = 'apple.png';
        this.appleImage.onload = () => {
            this.drawInitialImage();
        };

        this.setupEventListeners();
        this.initializeCanvas();
    }

    initializeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // スケーリングの再設定（前回のスケールをリセット）
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        // 再描画イベント
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.initializeCanvas();
                this.drawInitialImage();
            }, 100);
        });
    }

    drawInitialImage() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const imgSize = Math.min(this.canvas.width, this.canvas.height) * 0.5;
        const imgX = centerX - imgSize / 2;
        const imgY = centerY - imgSize / 2;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.appleImage, imgX, imgY, imgSize, imgSize);

        this.totalSeconds = this.WORK_MINUTES * 60;
        this.drawProgress(0);
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.togglePomodoro());
        this.resumeButton.addEventListener('click', () => this.resumePomodoro());
        this.resetButton.addEventListener('click', () => this.resetPomodoro());

        this.resumeButton.style.display = 'none';
        this.resetButton.style.display = 'none';
        this.startButton.textContent = '開始';
    }

    togglePomodoro() {
        if (!this.isRunning) {
            this.startPomodoro();
        } else {
            this.stopTimer();
        }
    }

    startPomodoro() {
        this.totalSeconds = this.WORK_MINUTES * 60;
        this.isBreak = false;
        this.isRunning = true;

        this.updateTimeDisplay(this.totalSeconds);
        this.drawProgress(0);
        this.startTimer();

        this.startButton.textContent = 'ストップ';
        this.message.textContent = 'ポモドーロ中...';
        this.resumeButton.style.display = 'none';
        this.resetButton.style.display = 'none';
    }

    startTimer() {
        clearInterval(this.currentInterval);

        this.currentInterval = setInterval(() => {
            if (this.totalSeconds <= 0) {
                clearInterval(this.currentInterval);
                if (!this.isBreak) {
                    this.workSound.play();
                    this.message.textContent = 'お疲れさまでした！10分休憩しましょう。';
                    this.isBreak = true;
                    this.totalSeconds = this.BREAK_MINUTES * 60;
                    this.drawProgress(0);
                    this.startTimer();
                } else {
                    this.breakSound.play();
                    this.endTimer();
                }
                return;
            }

            this.totalSeconds--;
            const fullTime = this.isBreak ? this.BREAK_MINUTES * 60 : this.WORK_MINUTES * 60;
            const progress = 1 - this.totalSeconds / fullTime;

            this.updateTimeDisplay(this.totalSeconds);
            this.drawProgress(progress);
        }, 1000);

        this.isRunning = true;
    }

    stopTimer() {
        clearInterval(this.currentInterval);
        this.isRunning = false;

        this.message.textContent = 'タイマーを停止しました';
        this.startButton.style.display = 'none';
        this.resumeButton.style.display = 'inline-block';
        this.resetButton.style.display = 'inline-block';
    }

    resumePomodoro() {
        if (!this.isRunning) {
            this.message.textContent = 'ポモドーロ再開中...';
            this.startTimer();

            this.startButton.textContent = 'ストップ';
            this.startButton.style.display = 'inline-block';
            this.resumeButton.style.display = 'none';
            this.resetButton.style.display = 'none';
        }
    }

    resetPomodoro() {
        clearInterval(this.currentInterval);
        this.isRunning = false;
        this.isBreak = false;
        this.totalSeconds = 0;

        this.updateTimeDisplay(0);
        this.drawProgress(0);
        this.message.textContent = 'ポモドーロを開始しますか？';

        this.startButton.textContent = '開始';
        this.startButton.style.display = 'inline-block';
        this.resumeButton.style.display = 'none';
        this.resetButton.style.display = 'none';
    }

    endTimer() {
        clearInterval(this.currentInterval);
        this.isRunning = false;
        this.isBreak = false;

        this.message.textContent = 'ポモドーロが終了しました';
        this.currentPomodoro++;
        this.pomodoroCount.textContent = `ポモドーロ: ${this.currentPomodoro}回目`;

        this.startButton.textContent = '開始';
        this.startButton.style.display = 'inline-block';
        this.resumeButton.style.display = 'none';
        this.resetButton.style.display = 'none';

        this.drawProgress(0);
    }

    updateTimeDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.timeDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    drawProgress(progress) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.45;

        const imgSize = Math.min(this.canvas.width, this.canvas.height) * 0.5;
        const imgX = centerX - imgSize / 2;
        const imgY = centerY - imgSize / 2;

        // 画像
        this.ctx.drawImage(this.appleImage, imgX, imgY, imgSize, imgSize);

        // ベース円
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = '#f5cfcf';
        this.ctx.stroke();

        // 進捗円
        if (progress > 0) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
            this.ctx.strokeStyle = '#d43f3f';
            this.ctx.lineWidth = 10;
            this.ctx.stroke();
        }

        // 時間テキスト
        const minutes = Math.floor(this.totalSeconds / 60);
        const seconds = this.totalSeconds % 60;
        const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(timeText, centerX, centerY);
    }
}

// ✅ Service Worker の登録（オプション）
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker 登録成功:', registration.scope);
        })
        .catch(error => {
            console.log('Service Worker 登録失敗:', error);
        });
}

// ✅ 起動時にインスタンス生成
window.addEventListener('load', () => {
    new PomodoroTimer();
});
