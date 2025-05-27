document.getElementById('searchInput').addEventListener('input', function() {
    let searchText = this.value.toLowerCase();
    let content = document.getElementById('content');
    let paragraphs = content.querySelectorAll('p');
    let counter = document.getElementById('counter');
    let matchCount = 0;

    paragraphs.forEach(p => {
        p.innerHTML = p.textContent; // Efface les surlignages précédents
        if (searchText) {
            let regex = new RegExp(searchText, 'gi');
            p.innerHTML = p.textContent.replace(regex, (match) => {
                matchCount++;
                return `<mark>${match}</mark>`;
            });
        }
    });

    counter.textContent = matchCount ? `${matchCount} correspondances trouvées` : 'Aucune correspondance trouvée';
});