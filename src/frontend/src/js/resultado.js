// Funcionalidad de tabs para la página de resultados
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remover clase active de todos los botones
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Remover clase active de todos los contenidos
            tabContents.forEach(content => content.classList.remove('active'));

            // Agregar clase active al botón clickeado
            this.classList.add('active');

            // Mostrar el contenido correspondiente
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Auto-seleccionar la primera tab con resultados
    function selectFirstNonEmptyTab() {
        for (let i = 0; i < tabButtons.length; i++) {
            const tab = tabButtons[i].getAttribute('data-tab');
            const content = document.getElementById(tab);

            // Verificar si tiene contenido (no está vacío)
            const isEmpty = content.querySelector('.empty-section') !== null;

            if (!isEmpty) {
                tabButtons[i].click();
                break;
            }
        }
    }

    // Ejecutar al cargar
    selectFirstNonEmptyTab();
});