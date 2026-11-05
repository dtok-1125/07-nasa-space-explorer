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
  const gallery = document.getElementById("gallery");
  const getImagesButton = document.querySelector(".filters button");

  if (!startDate || !endDate) {
    showGalleryMessage("Choose both a start date and an end date to explore.", true);
    return;
  }

  getImagesButton.disabled = true;

  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    const response = await fetch(`/api/apod?${params}`);
    let data;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error("The server returned an invalid response. Please try again later.");
    }

    if (!response.ok) {
      const message = response.status === 429 || response.status === 503
        ? `NASA's image service is temporarily busy (HTTP ${response.status}). Please wait before trying again.`
        : typeof data.error === "string"
          ? data.error
          : `NASA image request failed (HTTP ${response.status}).`;

      showGalleryMessage(message, true);
      return;
    }

    const entries = Array.isArray(data) ? data : [data];
    const images = entries.filter((item) =>
      item &&
      item.media_type === "image" &&
      typeof item.url === "string" &&
      typeof item.title === "string"
    );

    if (images.length === 0) {
      showGalleryMessage("NASA returned no astronomy images for this date range.", true);
      return;
    }

    gallery.replaceChildren();

    images.forEach((item) => {
      const image = document.createElement("img");
      image.src = item.url;
      image.alt = item.title || `Astronomy Picture of the Day for ${item.date}`;
      image.loading = "lazy";
      gallery.appendChild(image);
    });
  } catch (error) {
    console.error("Unable to load NASA images:", error.message);
    showGalleryMessage(
      error.message || "Unable to load NASA images right now. Please try again later.",
      true
    );
  } finally {
    getImagesButton.disabled = false;
  }
}

function showGalleryMessage(message, isError = false) {
  const gallery = document.getElementById("gallery");
  const placeholder = document.createElement("div");
  const paragraph = document.createElement("p");

  placeholder.className = "placeholder";
  if (isError) {
    placeholder.setAttribute("role", "alert");
  }
  paragraph.textContent = message;
  placeholder.appendChild(paragraph);
  gallery.replaceChildren(placeholder);
}

const getImagesButton = document.querySelector(".filters button");
getImagesButton.addEventListener('click', getSpaceImages);
