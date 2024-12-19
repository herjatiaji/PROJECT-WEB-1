document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".toggleButton");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const textElement = button.previousElementSibling;
            textElement.classList.toggle("expanded");

            if (textElement.classList.contains("expanded")) {
                button.textContent = "See Less";
            } else {
                button.textContent = "See More";
            }
        });
    });

    // Fetch news from the server and populate the page
    fetch('/news')
        .then(response => response.json())
        .then(newsData => {
            const newsContainer = document.querySelector('.slide');
            newsData.forEach(newsItem => {
                const newsElement = document.createElement('div');
                newsElement.classList.add('item');
                newsElement.style.backgroundImage = `url(${newsItem.image_url})`;  // Ganti dengan path gambar yang sesuai
                newsElement.innerHTML = `
                    <div class="content">
                        <h2 class="name">${newsItem.title}</h2>
                        <div class="article-info">
                            <div class="editor-name">
                                <span><b>${newsItem.editor}</b></span>
                            </div>
                            <span class="editor">Editor</span>
                            <span class="publish-date">${newsItem.publish_date}</span>
                        </div>
                        <p class="text-limit">${newsItem.content}</p>
                        <button class="toggleButton">See More</button>
                    </div>
                `;
                newsContainer.appendChild(newsElement);
            });
        })
        .catch(err => console.log('Error fetching news:', err));
});
