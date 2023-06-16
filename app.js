let currentMusic = 0;

let music = document.querySelector('#audio');


const seekBar = document.querySelector('.seek-bar');
const songName = document.querySelector('.music-name');
const artistName = document.querySelector('.artist-name');
const disk = document.querySelector('.disk');
const currentTime = document.querySelector('.current-time');
const musicDuration = document.querySelector('.song-duration');
const playBtn = document.querySelector('.play-btn');
const forwardBtn = document.querySelector('.forward-btn');
const backwardBtn = document.querySelector('.backward-btn');

// визуализация
let audioSource;
const barsQuantity = 16;
const visualizerContainer = document.querySelector(".visualizer");

playBtn.addEventListener('click', () => {
  if (playBtn.className.includes('pause')) {
    setMusic(currentMusic);
    vizualize();
    music.play();
  } else {
    music.pause();
  }
  playBtn.classList.toggle('pause');
  disk.classList.toggle('play');
})

//устновка музыки
const setMusic = (i) => {
  music = new Audio();
  visualizerContainer.innerHTML = "";

  seekBar.value = 0; //Установка значения ползунка диапазона равным 0
  let song = songs[i];
  currentMusic = i;
  music.src = song.path;

  songName.innerHTML = song.name;
  artistName.innerHTML = song.artist;
  disk.style.backgroundImage = `url('${song.cover}')`;

  currentTime.innerHTML = '00:00';
  setTimeout(() => {
    seekBar.max = music.duration;
    musicDuration.innerHTML = formatTime(music.duration);
  }, 300);
}
setMusic(0);

//форматирование времени в минутном и секундном виде
const formatTime = (time) => {
  let min = Math.floor(time / 60);
  if (min < 10) {
    min = `0${min}`;
  }
  let sec = Math.floor(time % 60);
  if (sec < 10) {
    sec = `0${sec}`;
  }
  return `${min} : ${sec}`;
}

// панель поиска (seek bar)
setInterval(() => {
  seekBar.value = music.currentTime;
  currentTime.innerHTML = formatTime(music.currentTime);
  if (Math.floor(music.currentTime) == Math.floor(seekBar.max)) { // непрерывный запуск
    forwardBtn.click();
  }
}, 500)
// возможность установки времени переключения пользователем 
seekBar.addEventListener('change', () => {
  music.currentTime = seekBar.value;
})
//функция вопроизведения музыки (чтобы при переключении музыка не ставилась на паузу)
const playMusic = () => {
  music.play();

  // дисконектимся от предыдущей песни и начинаем визуализацию новой
  if (audioSource) audioSource.disconnect();
  vizualize();

  playBtn.classList.remove('pause');
  disk.classList.add('play');
}
//кнопки вперед и назад
forwardBtn.addEventListener('click', () => {
  if (currentMusic >= songs.length - 1) {
    currentMusic = 0;
  } else {
    currentMusic++;
  }
  setMusic(currentMusic);
  playMusic();
})

backwardBtn.addEventListener('click', () => {
  if (currentMusic <= 0) {
    currentMusic = songs.length - 1;
  } else {
    currentMusic--;
  }
  setMusic(currentMusic);
  playMusic();
})

// визуализация


function vizualize() {
  // создаем новый контекст
  const ctx = new AudioContext();
  // подключаем к плееру
  audioSource = ctx.createMediaElementSource(music);

  // создаем анализатор
  const analayzer = ctx.createAnalyser();

  // связываем все вместе
  audioSource.connect(analayzer);
  audioSource.connect(ctx.destination);

  // создаем массив 'высот'
  const frequencyData = new Uint8Array(analayzer.frequencyBinCount);
  analayzer.getByteFrequencyData(frequencyData);

  // добавляем столбики с id баров
  for (let i = 0; i < barsQuantity; i++) {
    const bar = document.createElement("DIV");
    bar.setAttribute("id", "bar" + i);
    bar.setAttribute("class", "visualizer__bar");
    visualizerContainer.appendChild(bar);
  }

  // функция по изменению высоты баров
  function renderFrame() {

    // получаем массив 'высот'
    analayzer.getByteFrequencyData(frequencyData);

    // ставим каждому бару свою высоту на данном кадре
    for (let i = 0; i < barsQuantity; i++) {

      const index = (i + 10) * 2;
      const fd = frequencyData[index] / 7;

      const bar = document.querySelector("#bar" + i);
      const barHeight = Math.max(4, fd || 0);

      if (bar) {
        bar.style.height = barHeight + "px";
      }
    }

    // запускаем на повтор
    window.requestAnimationFrame(renderFrame);

  }

  renderFrame();
}
