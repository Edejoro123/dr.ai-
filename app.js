const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Simulated in-memory cache for news articles
let newsCache = [];

// Fetch health news from NewsAPI
const fetchHealthNews = async () => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'health',
        sortBy: 'publishedAt',
        pageSize: 5, // Fetch 5 articles daily
        apiKey: '561e7ec563504479bc692eed706124e1', // Replace with your NewsAPI key
      },
    });

    // Process and cache news
    newsCache = response.data.articles.map((article) => ({
      title: article.title,
      description: article.description || "Click 'Read More' for the full story.",
      link: article.url,
      image: article.urlToImage || 'https://via.placeholder.com/300', // Placeholder image
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
  }
};

// API endpoint for fetching news
app.get('/api/news', (req, res) => {
  res.json(newsCache);
});

// Initial fetch and schedule updates every 24 hours
fetchHealthNews();
setInterval(fetchHealthNews, 24 * 60 * 60 * 1000); // Update daily

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
