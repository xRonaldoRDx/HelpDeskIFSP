/* ==========================================================
   SISTEMA DE MANUTENÇÃO IFSP — PREMIUM SCRIPT
   Versão 2.0 | Space Grotesk + Bootstrap 5.3
   ========================================================== */

'use strict';

// ============================================================
// 1. SISTEMA DE TOAST NOTIFICATIONS
// ============================================================

/**
 * Exibe uma Toast Notification moderna no canto inferior direito.
 * @param {string} message  - Texto da mensagem
 * @param {string} type     - 'success' | 'danger' | 'warning'
 * @param {number} duration - Duração em ms (padrão: 5000)
 */
function showToast(message, type = 'success', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'bi-check-circle-fill',
        danger:  'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
    };

    const titles = {
        success: 'Sucesso!',
        danger:  'Erro',
        warning: 'Atenção',
    };

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `
        <i class="bi ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Fechar notificação">
            <i class="bi bi-x-lg"></i>
        </button>
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    // Ao clicar no toast ou no botão fechar, remove-o
    const closeBtn = toast.querySelector('.toast-close');
    const dismissToast = () => removeToast(toast);
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissToast();
    });
    toast.addEventListener('click', dismissToast);

    container.appendChild(toast);

    // Remove automaticamente após a duração
    const timer = setTimeout(() => removeToast(toast), duration);

    // Pausa o timer ao passar o mouse
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timer);
        const progressBar = toast.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.animationPlayState = 'paused';
        }
    });
}

/**
 * Remove um toast com animação de saída.
 * @param {HTMLElement} toast - Elemento a ser removido
 */
function removeToast(toast) {
    if (!toast || toast.classList.contains('toast-hiding')) return;
    toast.classList.add('toast-hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

// ============================================================
// 2. CARREGA MENSAGENS FLASH DO FLASK COMO TOASTS
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const flashContainer = document.getElementById('flask-flash-data');
    if (flashContainer) {
        const spans = flashContainer.querySelectorAll('span[data-message]');
        spans.forEach((span, index) => {
            const category = span.dataset.category || 'success';
            const message  = span.dataset.message  || '';
            // Atraso escalonado para toasts em sequência
            setTimeout(() => showToast(message, category, 6000), index * 300);
        });
    }
});

// ============================================================
// 3. LÓGICA DO FORMULÁRIO
// ============================================================

// Abre o Modal de Erro Bonito
function mostrarErro(mensagemTexto) {
    const modalEl = document.getElementById('modalErro');
    if (!modalEl) return;
    document.getElementById('mensagemDoModal').innerText = mensagemTexto;
    const meuModal = new bootstrap.Modal(modalEl);
    meuModal.show();
}

// Exibe as subcategorias dinamicamente com animação
function mostrarSubcategorias(categoriaSelecionada) {
    // Esconde todas
    document.querySelectorAll('.subcategoria-box').forEach(caixa => {
        caixa.style.display = 'none';
    });

    // Remove required de selects anteriores
    document.getElementById('sel_hw').required = false;
    document.getElementById('sel_sw').required = false;

    // Exibe a caixa correta com animação
    let alvo = null;
    if (categoriaSelecionada === 'hardware') {
        alvo = document.getElementById('sub_hardware');
        document.getElementById('sel_hw').required = true;
    } else if (categoriaSelecionada === 'software') {
        alvo = document.getElementById('sub_software');
        document.getElementById('sel_sw').required = true;
    } else if (categoriaSelecionada === 'outros') {
        alvo = document.getElementById('sub_outros');
    }

    if (alvo) {
        alvo.style.display = 'block';
        // Força re-animação ao trocar de categoria
        alvo.style.animation = 'none';
        alvo.offsetHeight; // Reflow
        alvo.style.animation = '';
    }
}

// ============================================================
// 4. VALIDAÇÃO EM TEMPO REAL + SUBMIT COM LOADING
// ============================================================

const formChamado = document.getElementById('formChamado');

if (formChamado) {

    // --- Filtro em tempo real para o Nome (apenas letras e espaços) ---
    const campoNome = document.getElementById('nome');
    // Regex que permite letras latinas (com acentos) e espaços
    const regexNomeValido = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (campoNome) {
        campoNome.addEventListener('input', function () {
            // Remove qualquer caractere que não seja letra latina ou espaço
            this.value = this.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
            this.classList.remove('is-invalid');
        });
    }

    // --- Remove validação de erro ao corrigir os campos ---
    const campoProntuario = document.getElementById('prontuario');
    if (campoProntuario) {
        campoProntuario.addEventListener('input', function () {
            // Auto-uppercases as letras do início
            const cur = this.value;
            if (cur.length <= 2) {
                this.value = cur.toUpperCase();
            }
            this.classList.remove('is-invalid');
        });
    }

    function limparErroPatrimonio() {
        document.getElementById('pat_pc').classList.remove('is-invalid');
        document.getElementById('pat_tela').classList.remove('is-invalid');
    }

    document.getElementById('pat_pc').addEventListener('input', limparErroPatrimonio);
    document.getElementById('pat_tela').addEventListener('input', limparErroPatrimonio);

    // --- Remove validação de erro ao corrigir subcategoria / laboratório ---
    const selHW = document.getElementById('sel_hw');
    const selSW = document.getElementById('sel_sw');
    if (selHW) selHW.addEventListener('change', function () { this.classList.remove('is-invalid'); });
    if (selSW) selSW.addEventListener('change', function () { this.classList.remove('is-invalid'); });

    // --- Remove erro do campo de descrição ao digitar ---
    const campoDescricaoLive = document.getElementById('descricao');
    if (campoDescricaoLive) {
        campoDescricaoLive.addEventListener('input', function () {
            this.classList.remove('is-invalid');
        });
    }


    // --- Intercepta o submit ---
    formChamado.addEventListener('submit', function (evento) {

        // ── PASSO 1: VALIDAÇÃO DO PRONTUÁRIO ──────────────────────────────
        const prontuario = document.getElementById('prontuario').value.trim();
        const regexProntuario = /^[sS][pP]\d{6}[\dxX]$/;
        if (!regexProntuario.test(prontuario)) {
            evento.preventDefault();
            mostrarErro(
                'O Prontuário deve começar com "SP" seguido de 7 números (ou 6 números e um "X").\nExemplo: SP1234567 ou SP123456X.'
            );
            document.getElementById('prontuario').classList.add('is-invalid');
            return;
        }

        // ── PASSO 2: VALIDAÇÃO DO NOME COMPLETO ───────────────────────────
        const nome = (campoNome ? campoNome.value : '').trim();
        if (nome === '' || !regexNomeValido.test(nome)) {
            evento.preventDefault();
            mostrarErro(
                'O campo Nome Completo é obrigatório e deve conter apenas letras e espaços.\n' +
                'Números e caracteres especiais não são permitidos.'
            );
            if (campoNome) campoNome.classList.add('is-invalid');
            return;
        }

        // ── PASSO 3: VALIDAÇÃO DO LABORATÓRIO ─────────────────────────────
        const campoLaboratorio = document.getElementById('laboratorio');
        if (campoLaboratorio) {
            const laboratorioValor = campoLaboratorio.value.trim();
            if (laboratorioValor === '') {
                evento.preventDefault();
                mostrarErro('É obrigatório selecionar o Laboratório onde o problema está ocorrendo.');
                campoLaboratorio.classList.add('is-invalid');
                campoLaboratorio.addEventListener('change', function () {
                    this.classList.remove('is-invalid');
                }, { once: true });
                return;
            }
        }

        // ── PASSO 4: VALIDAÇÃO DA CATEGORIA ───────────────────────────────
        const categoriaChecked = document.querySelector('input[name="categoria"]:checked');
        if (!categoriaChecked) {
            evento.preventDefault();
            mostrarErro('Você deve selecionar uma Categoria para o chamado: Hardware, Software ou Outros.');
            return;
        }

        // ── PASSO 5: VALIDAÇÃO DA DESCRIÇÃO (obrigatória para todos) ──────
        const campoDescricao = document.getElementById('descricao');
        const descricao = (campoDescricao ? campoDescricao.value : '').trim();
        if (descricao === '') {
            evento.preventDefault();
            mostrarErro(
                'O campo de Descrição é obrigatório.\n' +
                'Por favor, explique o problema com o máximo de detalhes possível.'
            );
            if (campoDescricao) campoDescricao.classList.add('is-invalid');
            return;
        }


        // ── PASSO 5: VALIDAÇÃO DA SUBCATEGORIA ────────────────────────────
        if (categoriaChecked.value === 'Hardware') {
            const selHW = document.getElementById('sel_hw');
            if (!selHW || selHW.value === '') {
                evento.preventDefault();
                mostrarErro(
                    'Você selecionou a categoria "Hardware".\n' +
                    'Por favor, selecione qual equipamento está com problema (Monitor, Teclado, Mouse, etc.).'
                );
                if (selHW) selHW.classList.add('is-invalid');
                return;
            }
        } else if (categoriaChecked.value === 'Software') {
            const selSW = document.getElementById('sel_sw');
            if (!selSW || selSW.value === '') {
                evento.preventDefault();
                mostrarErro(
                    'Você selecionou a categoria "Software".\n' +
                    'Por favor, selecione o tipo de problema: Aplicativos/Programas ou Redes/Wi-Fi.'
                );
                if (selSW) selSW.classList.add('is-invalid');
                return;
            }
        }

        // ── PASSO 6: VALIDAÇÃO DO PATRIMÔNIO (Cross-Field) ────────────────
        const patPC   = document.getElementById('pat_pc').value.trim();
        const patTela = document.getElementById('pat_tela').value.trim();
        const regexPatrimonio = /^\d{6}$/;

        if (patPC === '' && patTela === '') {
            evento.preventDefault();
            mostrarErro('Você deve preencher o Patrimônio do PC ou o Patrimônio da Tela para abrir o chamado.');
            document.getElementById('pat_pc').classList.add('is-invalid');
            document.getElementById('pat_tela').classList.add('is-invalid');
            return;
        }

        if (patPC !== '' && !regexPatrimonio.test(patPC)) {
            evento.preventDefault();
            mostrarErro('O Patrimônio do PC deve conter exatamente 6 números.\nExemplo: 123456.');
            document.getElementById('pat_pc').classList.add('is-invalid');
            return;
        }

        if (patTela !== '' && !regexPatrimonio.test(patTela)) {
            evento.preventDefault();
            mostrarErro('O Patrimônio do Monitor deve conter exatamente 6 números.\nExemplo: 123456.');
            document.getElementById('pat_tela').classList.add('is-invalid');
            return;
        }

        // ── PASSO 7: TUDO OK — Ativa o estado de Loading no botão ─────────
        ativarLoadingBtn();
    });
}

// ============================================================
// 5. ESTADO DE LOADING NO BOTÃO
// ============================================================

/**
 * Ativa o spinner no botão de submit e desabilita o botão
 * para prevenir duplos envios.
 */
function ativarLoadingBtn() {
    const btnSubmit = document.getElementById('btn-submit');
    const conteudoNormal  = document.getElementById('btn-submit-content');
    const conteudoLoading = document.getElementById('btn-submit-loading');

    if (!btnSubmit || !conteudoNormal || !conteudoLoading) return;

    btnSubmit.disabled = true;
    btnSubmit.classList.add('loading');
    conteudoNormal.style.display  = 'none';
    conteudoLoading.style.display = 'inline-flex';
    conteudoLoading.style.alignItems = 'center';
}

// ============================================================
// 6. MODO ESCURO (Todas as páginas)
// ============================================================

const btnTema    = document.getElementById('btn-tema');
const iconeTema  = document.getElementById('icone-tema');
const htmlEl     = document.documentElement;

// Aplica o tema salvo ao carregar (ou light por padrão)
const temaSalvo = localStorage.getItem('tema_ifsp') || 'light';
htmlEl.setAttribute('data-bs-theme', temaSalvo);
atualizarIcone(temaSalvo);

// Alterna o tema ao clicar no botão
if (btnTema) {
    btnTema.addEventListener('click', () => {
        const temaAtual = htmlEl.getAttribute('data-bs-theme');
        const novoTema  = temaAtual === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-bs-theme', novoTema);
        localStorage.setItem('tema_ifsp', novoTema);
        atualizarIcone(novoTema);
    });
}

function atualizarIcone(tema) {
    if (!iconeTema) return;
    if (tema === 'dark') {
        iconeTema.classList.remove('bi-moon-fill');
        iconeTema.classList.add('bi-sun-fill');
    } else {
        iconeTema.classList.remove('bi-sun-fill');
        iconeTema.classList.add('bi-moon-fill');
    }
}