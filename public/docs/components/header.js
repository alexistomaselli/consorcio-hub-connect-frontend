document.addEventListener('DOMContentLoaded', function() {
    insertHeader();
});

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('instalacion')) return 'instalacion';
    if (path.includes('modelo-datos')) return 'modelo-datos';
    if (path.includes('funcionalidades')) return 'funcionalidades';
    if (path.includes('owners-system')) return 'owners';
    if (path.includes('database-config')) return 'database';
    if (path.includes('procesos')) return 'procesos';
    return 'index';
}

function createHeader() {
    const currentPage = getCurrentPage();
    return `
    <header class="header">
        <div class="header-content">
            <div class="logo-text">CONSORCIO HUB</div>
            <nav class="nav-menu">
                <!-- Arquitectura y Setup -->
                <div class="dropdown">
                    <a class="nav-link dropdown-toggle ${['index', 'instalacion'].includes(currentPage) ? 'active' : ''}">
                        Sistema <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="index.html" class="dropdown-item ${currentPage === 'index' ? 'active' : ''}">Arquitectura</a>
                        <a href="instalacion.html" class="dropdown-item ${currentPage === 'instalacion' ? 'active' : ''}">Instalación</a>
                    </div>
                </div>

                <!-- Base de Datos -->
                <div class="dropdown">
                    <a class="nav-link dropdown-toggle ${['modelo-datos', 'database-config'].includes(currentPage) ? 'active' : ''}">
                        Base de Datos <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="modelo-datos.html" class="dropdown-item ${currentPage === 'modelo-datos' ? 'active' : ''}">Modelo de Datos</a>
                        <a href="database-config.html" class="dropdown-item ${currentPage === 'database-config' ? 'active' : ''}">Configuración</a>
                    </div>
                </div>

                <!-- Procesos de Negocio -->
                <div class="dropdown">
                    <a class="nav-link dropdown-toggle ${['procesos', 'owners-system'].includes(currentPage) ? 'active' : ''}">
                        Procesos <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="procesos.html" class="dropdown-item ${currentPage === 'procesos' ? 'active' : ''}">Documentación de Procesos</a>
                        <a href="owners-system.html" class="dropdown-item ${currentPage === 'owners' ? 'active' : ''}">Sistema de Propietarios</a>
                    </div>
                </div>

                <!-- Funcionalidades -->
                <div class="dropdown">
                    <a class="nav-link dropdown-toggle ${['funcionalidades'].includes(currentPage) ? 'active' : ''}">
                        Funcionalidades <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="dropdown-content">
                        <a href="funcionalidades.html" class="dropdown-item ${currentPage === 'funcionalidades' ? 'active' : ''}">Características</a>
                    </div>
                </div>
            </nav>
        </div>
    </header>`;
}

function insertHeader() {
    const header = createHeader();
    document.body.insertAdjacentHTML('afterbegin', header);
}
