export function changeLanguage(){
    const languageSelect = document.getElementById("language-select");
    const currentPath = window.location.pathname;
    
    languageSelect.addEventListener("change", function() {
        const selectedLanguage = languageSelect.value;
        let newPath;

        if (currentPath.includes('/ru/')) {
            newPath = currentPath.replace('/ru/', `/${selectedLanguage}/`);
        } else if (currentPath.includes('/en/')) {
            newPath = currentPath.replace('/en/', `/${selectedLanguage}/`);
        } else if (currentPath.includes('/uk/')) {
            newPath = currentPath.replace('/uk/', `/${selectedLanguage}/`);
        } else {
            newPath = `/${selectedLanguage}${currentPath}`;
        }

        window.location.href = newPath;
    });

    if (currentPath.includes('/ru/')) {
        languageSelect.value = 'ru';
    } else if (currentPath.includes('/en/')) {
        languageSelect.value = 'en';
    } else if (currentPath.includes('/uk/')) {
        languageSelect.value = 'uk';
    }
}