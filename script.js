const url = "https://raw.githubusercontent.com/ahmad1212as/Reeh-Balak/main/information/as.json";

const classNameDisplay = document.getElementById('classNameDisplay');
const subjectsList = document.getElementById('subjectsList');
const questionsList = document.getElementById('questionsList');
const questionsTitle = document.getElementById('questionsTitle');
const questionsContainer = document.getElementById('questionsContainer');
const imageOverlay = document.getElementById('imageOverlay');
const overlayImage = document.getElementById('overlayImage');
const closeOverlayBtn = document.getElementById('closeOverlayBtn');
const backToSubjectsBtn = document.getElementById('backToSubjectsBtn');
const backToTodayBtn = document.getElementById('backToTodayBtn');
const todayDateDisplay = document.getElementById('todayDateDisplay');

function formatDate(date) {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

const today = new Date();
const todayFormatted = formatDate(today);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayFormatted = formatDate(yesterday);
todayDateDisplay.textContent = todayFormatted;

function cleanImageLinks(subject) {
  return Object.entries(subject)
    .filter(([key, value]) => key.startsWith('Image link') && value && value !== '*********')
    .map(([_, value]) => value);
}

function createSubjectItem(subject) {
  const images = cleanImageLinks(subject);
  if (!subject['Name of the subject'] || images.length === 0) return null;

  const div = document.createElement('div');
  div.className = 'subject-item';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'subject-name';
  nameSpan.textContent = subject['Name of the subject'];

  const dateSpan = document.createElement('span');
  dateSpan.className = 'subject-date';
  dateSpan.textContent = subject['the date'];

  div.appendChild(nameSpan);
  div.appendChild(dateSpan);

  div.addEventListener('click', () => showQuestions(subject));

  return div;
}

function showQuestions(subject) {
  questionsTitle.textContent = `${subject['Name of the subject']} - ${subject['the date']}`;
  questionsContainer.innerHTML = '';

  const images = cleanImageLinks(subject);
  images.forEach((src, i) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.textContent = `السؤال ${i + 1}`;
    questionDiv.addEventListener('click', () => openOverlay(src));
    questionsContainer.appendChild(questionDiv);
  });

  subjectsList.style.display = 'none';
  questionsList.classList.add('active');
  backToTodayBtn.style.display = 'none';
}

function openOverlay(src) {
  overlayImage.src = src;
  imageOverlay.classList.add('active');
}

function closeOverlay() {
  overlayImage.src = '';
  imageOverlay.classList.remove('active');
}

closeOverlayBtn.addEventListener('click', closeOverlay);
imageOverlay.addEventListener('click', (e) => {
  if (e.target === imageOverlay) closeOverlay();
});

backToSubjectsBtn.addEventListener('click', () => {
  questionsList.classList.remove('active');
  subjectsList.style.display = 'flex';
  if (showingPrevious) backToTodayBtn.style.display = 'inline-block';
});

let previousSubjects = [];
let todaysSubjects = [];
let showingPrevious = false;

function showSubjectsList(subjects) {
  subjectsList.classList.remove('empty-message');
  subjectsList.innerHTML = '';
  subjects.forEach(subject => {
    const item = createSubjectItem(subject);
    if (item) subjectsList.appendChild(item);
  });
  subjectsList.style.display = 'flex';
}

function showNoHomeworkMessage() {
  subjectsList.classList.add('empty-message');
  subjectsList.innerHTML = `<p>لم يتم إضافة واجبات هذا اليوم بعد أو لا توجد واجبات له. فريقنا يعمل على تحميل الأسئلة. نشكركم على صبركم.</p>`;
}

fetch(url)
  .then(res => res.json())
  .then(json => {
    if (json.length > 0 && json[0]['class']) {
      classNameDisplay.textContent = json[0]['class'];
    }

    const allSubjects = json.slice(1);
    todaysSubjects = allSubjects.filter(subject => subject['the date'] === todayFormatted);
    previousSubjects = allSubjects.filter(subject => subject['the date'] === yesterdayFormatted);

    if (todaysSubjects.length === 0) {
      if (previousSubjects.length === 0) {
        showNoHomeworkMessage();
      } else {
        subjectsList.classList.add('empty-message');
        subjectsList.innerHTML = `
          <p>لم يتم إضافة واجبات هذا اليوم بعد أو لا توجد واجبات له. فريقنا يعمل على تحميل الأسئلة. نشكركم على صبركم.</p>
          <button id="showPreviousBtn" class="show-previous-btn">عرض واجبات اليوم السابق (${yesterdayFormatted})</button>
        `;

        document.getElementById('showPreviousBtn').addEventListener('click', () => {
          showingPrevious = true;
          backToTodayBtn.style.display = 'inline-block';
          subjectsList.classList.remove('empty-message');
          showSubjectsList(previousSubjects);
        });
      }
    } else {
      showingPrevious = false;
      backToTodayBtn.style.display = 'none';
      showSubjectsList(todaysSubjects);
    }
  })
  .catch(err => {
    subjectsList.classList.add('empty-message');
    subjectsList.innerHTML = `<p>حدث خطأ أثناء تحميل البيانات، يرجى المحاولة لاحقاً.</p>`;
  });

backToTodayBtn.addEventListener('click', () => {
  showingPrevious = false;
  backToTodayBtn.style.display = 'none';
  questionsList.classList.remove('active');

  if (todaysSubjects.length === 0) {
    if (previousSubjects.length === 0) {
      showNoHomeworkMessage();
    } else {
      subjectsList.classList.add('empty-message');
      subjectsList.innerHTML = `
        <p>لم يتم إضافة واجبات هذا اليوم بعد أو لا توجد واجبات له. فريقنا يعمل على تحميل الأسئلة. نشكركم على صبركم.</p>
        <button id="showPreviousBtn" class="show-previous-btn">عرض واجبات اليوم السابق (${yesterdayFormatted})</button>
      `;

      document.getElementById('showPreviousBtn').addEventListener('click', () => {
        showingPrevious = true;
        backToTodayBtn.style.display = 'inline-block';
        subjectsList.classList.remove('empty-message');
        showSubjectsList(previousSubjects);
      });
    }
  } else {
    subjectsList.classList.remove('empty-message');
    showSubjectsList(todaysSubjects);
  }

  subjectsList.style.display = 'flex';
});
