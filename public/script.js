document.addEventListener('DOMContentLoaded', () => {
  const courseSelect = document.getElementById('course');
  const uvuIdInput = document.getElementById('uvuId');
  const uvuIdLabel = document.getElementById('uvuIdLabel');
  const uvuIdDisplay = document.getElementById('uvuIdDisplay');
  const logsList = document.querySelector('[data-cy="logs"]');
  const addLogBtn = document.getElementById('addLogBtn');
  const newLogTextarea = document.getElementById('newLog');
  const themeModal = document.getElementById('themeModal');
  const lightModeBtn = document.getElementById('lightModeBtn');
  const darkModeBtn = document.getElementById('darkModeBtn');

  // Function to apply the selected theme
  function applyTheme(theme) {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${theme}-mode`);
  }

  // Function to show the modal
  function showModal() {
    themeModal.style.display = 'block';
  }

  // Function to hide the modal
  function hideModal() {
    themeModal.style.display = 'none';
  }

  // Check if a theme preference is stored in localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // If no theme is saved, show the modal to let the user select one
    showModal();
  }

  // Event listeners for the Light Mode and Dark Mode buttons
  lightModeBtn.addEventListener('click', () => {
    applyTheme('light');
    localStorage.setItem('theme', 'light');
    hideModal();
  });

  darkModeBtn.addEventListener('click', () => {
    applyTheme('dark');
    localStorage.setItem('theme', 'dark');
    hideModal();
  });

  // Optional: Add a button on the page to change the theme manually
  const toggleThemeBtn = document.createElement('button');
  toggleThemeBtn.textContent = 'Change Theme';
  toggleThemeBtn.style.position = 'fixed';
  toggleThemeBtn.style.bottom = '10px';
  toggleThemeBtn.style.right = '10px';
  document.body.appendChild(toggleThemeBtn);

  toggleThemeBtn.addEventListener('click', showModal);

  function getLogs() {
    const uvuId = uvuIdInput.value;
    const courseId = courseSelect.value;
    if (/^\d{8}$/.test(uvuId) && courseId) {
      axios
        .get(
          `https://json-server-ft3qa5--3000.local.webcontainer.io/logs?courseId=${courseId}&uvuId=${uvuId}`
        )
        .then((response) => {
          const logs = response.data;
          uvuIdDisplay.textContent = `Student Logs for ${uvuId}`;
          uvuIdDisplay.classList.remove('hidden');
          logsList.innerHTML = '';
          logs.forEach((log) => {
            const li = document.createElement('li');
            li.innerHTML = `<div><small>${log.date}</small></div><pre><p>${log.text}</p></pre>`;
            li.addEventListener('click', () => {
              li.querySelector('p').classList.toggle('hidden');
            });
            logsList.appendChild(li);
          });
          if (logs.length > 0 || newLogTextarea.value.trim()) {
            addLogBtn.disabled = false;
          }
        })
        .catch((error) => {
          console.error(error);
          uvuIdDisplay.textContent = 'Failed to load logs. Please try again.';
          logsList.innerHTML = '';
          addLogBtn.disabled = true;
        });
    } else {
      uvuIdDisplay.classList.add('hidden');
      logsList.innerHTML = '';
      addLogBtn.disabled = true;
    }
  }

  axios
    .get(
      'https://json-server-ft3qa5--3000.local.webcontainer.io/api/v1/courses'
    )
    .then((response) => {
      const courses = response.data;
      console.log(courses);
      courses.forEach((course) => {
        const option = document.createElement('option');
        option.value = course.id;
        option.text = course.display;
        courseSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error('Error fetching courses:', error);
    });

  courseSelect.addEventListener('change', () => {
    const selectedCourse = courseSelect.value;
    if (selectedCourse) {
      uvuIdLabel.classList.remove('hidden');
      uvuIdInput.classList.remove('hidden');
    } else {
      uvuIdLabel.classList.add('hidden');
      uvuIdInput.classList.add('hidden');
      uvuIdInput.value = '';
      uvuIdDisplay.classList.add('hidden');
      logsList.innerHTML = '';
      addLogBtn.disabled = true;
    }
    getLogs();
  });

  uvuIdInput.addEventListener('blur', () => {
    getLogs();
  });

  newLogTextarea.addEventListener('input', () => {
    if (newLogTextarea.value.trim()) {
      addLogBtn.disabled = false;
    } else if (logsList.children.length === 0) {
      addLogBtn.disabled = true;
    }
  });

  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const newLog = newLogTextarea.value.trim();
    if (newLog) {
      axios
        .post('https://json-server-ft3qa5--3000.local.webcontainer.io/logs', {
          courseId: courseSelect.value,
          uvuId: uvuIdInput.value,
          text: newLog,
          date: new Date().toISOString(),
        })
        .then(() => {
          const li = document.createElement('li');
          li.innerHTML = `<div><small>${new Date().toLocaleString()}</small></div><pre><p>${newLog}</p></pre>`;
          li.addEventListener('click', () => {
            li.querySelector('p').classList.toggle('hidden');
          });
          logsList.appendChild(li);
          newLogTextarea.value = '';
          addLogBtn.disabled = true;
        })
        .catch((error) => {
          console.error('Error adding log:', error);
        });
    }
  });
});
