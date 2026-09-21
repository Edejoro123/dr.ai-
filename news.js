async function fetchNews() {
  try {
    const response = await fetch('/api/news');
    const newsArticles = await response.json();

    const newsContainer = document.getElementById('news-container');
    newsArticles.forEach((article) => {
      const articleDiv = document.createElement('div');
      articleDiv.classList.add('news-article');
      articleDiv.innerHTML = `
        <img src="${article.image}" alt="${article.title}">
        <h2>${article.title}</h2>
        <p>${article.description}</p>
        <a href="${article.link}" target="_blank">Read More</a>
      `;
      newsContainer.appendChild(articleDiv);
    });
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}

// Fetch news on page load
fetchNews();
