// Vocabulary Storage
const vocabularyStorage = {
    english: JSON.parse(localStorage.getItem('englishVocab')) || [],
    hungarian: JSON.parse(localStorage.getItem('hungarianVocab')) || [],
    french: JSON.parse(localStorage.getItem('frenchVocab')) || []
};

// Language Section Management
function showLanguageSection(language) {
    // Hide all language sections
    ['english', 'hungarian', 'french'].forEach(lang => {
        document.getElementById(`${lang}Section`).classList.add('hidden');
        // Clear test and word list areas
        document.getElementById(`${lang}TestArea`).classList.add('hidden');
        document.getElementById(`${lang}TestArea`).innerHTML = '';
        document.getElementById(`${lang}WordList`).innerHTML = '';
    });

    // Show selected language section
    document.getElementById(`${language}Section`).classList.remove('hidden');

    // Display existing words
    displayWords(language);
}

// Show Add Word Form
function showAddWordForm(language) {
    // Hide all add forms
    ['english', 'hungarian', 'french'].forEach(lang => {
        document.getElementById(`${lang}AddForm`).classList.add('hidden');
    });

    // Show selected language's add form
    document.getElementById(`${language}AddForm`).classList.remove('hidden');
}

// Save Word
function saveWord(language) {
    let word, synonym;

    if (language === 'english') {
        word = document.getElementById('englishWord').value.trim();
        synonym = document.getElementById('englishSynonym').value.trim();
    } else if (language === 'hungarian') {
        word = document.getElementById('hungarianWord').value.trim();
        synonym = document.getElementById('hungarianSynonym').value.trim();
    } else if (language === 'french') {
        word = document.getElementById('frenchWord').value.trim();
        synonym = document.getElementById('frenchArticle').value.trim();
    }

    // Validate input
    if (!word || !synonym) {
        alert('Please fill in both fields');
        return;
    }

    // Add to vocabulary and sort alphabetically
    vocabularyStorage[language].push({ word, synonym });
    vocabularyStorage[language].sort((a, b) => a.word.localeCompare(b.word));

    // Save to localStorage
    localStorage.setItem(`${language}Vocab`, JSON.stringify(vocabularyStorage[language]));

    // Clear input fields
    if (language === 'english') {
        document.getElementById('englishWord').value = '';
        document.getElementById('englishSynonym').value = '';
    } else if (language === 'hungarian') {
        document.getElementById('hungarianWord').value = '';
        document.getElementById('hungarianSynonym').value = '';
    } else if (language === 'french') {
        document.getElementById('frenchWord').value = '';
        document.getElementById('frenchArticle').value = '';
    }

    // Display updated words
    displayWords(language);
}

// Display Words
function displayWords(language) {
    const wordList = document.getElementById(`${language}WordList`);
    wordList.innerHTML = ''; // Clear previous list

    vocabularyStorage[language].forEach(item => {
        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word-item');
        wordDiv.textContent = `${item.word} - ${item.synonym}`;
        wordList.appendChild(wordDiv);
    });
}

// Start Test
function startTest(language) {
    const testArea = document.getElementById(`${language}TestArea`);
    testArea.innerHTML = ''; // Clear previous test
    testArea.classList.remove('hidden');

    // Get vocabulary for the language
    const vocab = vocabularyStorage[language];

    // Select random words (use all words if less than 10)
    const selectedWords = selectRandomWords(vocab, Math.min(vocab.length, 10));

    // Shuffle words and synonyms
    const shuffledWords = selectedWords.map(item => item.word).sort(() => Math.random() - 0.5);
    const shuffledSynonyms = selectedWords.map(item => item.synonym).sort(() => Math.random() - 0.5);

    // Create word and synonym divs
    shuffledWords.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word-item');
        wordDiv.textContent = word;
        wordDiv.dataset.word = word;

        const synonymDiv = document.createElement('div');
        synonymDiv.classList.add('word-item');
        synonymDiv.textContent = shuffledSynonyms[index];
        synonymDiv.dataset.synonym = shuffledSynonyms[index];

        // Add click events
        wordDiv.onclick = () => selectWord(wordDiv, language);
        synonymDiv.onclick = () => selectWord(synonymDiv, language);

        testArea.appendChild(wordDiv);
        testArea.appendChild(synonymDiv);
    });
}

// Word Selection for Test
function selectWord(selectedDiv, language) {
    const testArea = document.getElementById(`${language}TestArea`);
    const selectedWords = testArea.querySelectorAll('.selected');

    if (selectedWords.length === 2) {
        // Reset previous selections
        selectedWords.forEach(div => div.classList.remove('selected'));
    }

    selectedDiv.classList.toggle('selected');

    if (testArea.querySelectorAll('.selected').length === 2) {
        const firstWord = testArea.querySelector('.selected[data-word]');
        const firstSynonym = testArea.querySelector('.selected[data-synonym]');

        // Find the corresponding words in original vocabulary
        const match = vocabularyStorage[language].some(item => 
            (item.word === firstWord.dataset.word && item.synonym === firstSynonym.dataset.synonym) ||
            (item.word === firstSynonym.dataset.synonym && item.synonym === firstWord.dataset.word)
        );

        if (match) {
            firstWord.classList.add('matched');
            firstSynonym.classList.add('matched');
            firstWord.onclick = null;
            firstSynonym.onclick = null;
        }

        // Remove selected class
        firstWord.classList.remove('selected');
        firstSynonym.classList.remove('selected');

        // Check if all words are matched
        const allMatched = Array.from(testArea.children)
            .every(div => div.classList.contains('matched'));

        if (allMatched) {
            alert('Congratulations! You matched all words correctly!');
        }
    }
}

// Select Random Words
function selectRandomWords(vocab, count) {
    const shuffled = vocab.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Test Start Functions
function startEnglishTest() { startTest('english'); }
function startHungarianTest() { startTest('hungarian'); }
function startFrenchTest() { startTest('french'); }

// Export Data
function exportData() {
    const exportData = {
        english: vocabularyStorage.english,
        hungarian: vocabularyStorage.hungarian,
        french: vocabularyStorage.french
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import Data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = event => {
            try {
                const importedData = JSON.parse(event.target.result);

                // Validate imported data
                if (!importedData.english || !importedData.hungarian || !importedData.french) {
                    throw new Error('Invalid data format');
                }

                // Update localStorage and vocabularyStorage for each language
                Object.keys(importedData).forEach(language => {
                    vocabularyStorage[language] = importedData[language];
                    localStorage.setItem(`${language}Vocab`, JSON.stringify(importedData[language]));
                });

                alert('Data imported successfully!');

                // Refresh current language view if a language is currently selected
                const currentLanguage = document.querySelector('[id$="Section"]:not(.hidden)');
                if (currentLanguage) {
                    const language = currentLanguage.id.replace('Section', '');
                    displayWords(language);
                }
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}