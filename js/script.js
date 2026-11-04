// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);


async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${startDate}&end_date=${endDate}`;

  const response = await fetch(apiUrl);

if (!response.ok) {
  console.error("NASA API error:", response.status);
  return;
}

const data = await response.json();
console.log("NASA data:", data);

const getImagesButton = document.querySelector('.filters button');
getImagesButton.addEventListener('click', getSpaceImages);
  