document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('select_theme').addEventListener('change', (event) => {
        const selectedTheme = event.target.value;

        document.body.setAttribute('data-theme', selectedTheme);
    })

    document.getElementById('btn_change_theme').addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.body.setAttribute('data-theme', newTheme);

        document.getElementById('select_theme').value = newTheme;
    })
})
